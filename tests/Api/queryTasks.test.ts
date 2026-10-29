import type { CachedMetadata } from 'obsidian';
import moment from 'moment';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { Status } from '../../src/Statuses/Status';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { queryTasks } from '../../src/Api/queryTasks';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';

const registeredMockPaths: string[] = [];

function registerMockMetadata(cachedMetadata: CachedMetadata, filePath = 'mock.md') {
    const simulatedFile: SimulatedFile = {
        cachedMetadata,
        filePath,
        fileContents: '',
        getAllTags: [],
        parseFrontMatterTags: null,
        resolveLinkToPath: {},
    };
    (MockDataLoader as any).cache.set(filePath, simulatedFile);
    registeredMockPaths.push(filePath);
}

window.moment = moment;

describe('queryTasks', () => {
    afterEach(() => {
        GlobalQuery.getInstance().reset();
        resetSettings();
        registeredMockPaths.forEach((path) => (MockDataLoader as any).cache.delete(path));
        registeredMockPaths.length = 0;
    });

    describe('basic queries, filtering, sorting, and limits', () => {
        it('should return all tasks when query source is empty', () => {
            const task1 = new TaskBuilder().description('Task 1').build();
            const task2 = new TaskBuilder().description('Task 2').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('', [task1, task2], globalQuery);

            expect(results).toHaveLength(2);
            expect(results[0].description).toBe('Task 1');
            expect(results[1].description).toBe('Task 2');
        });

        it('should return empty array when allTasks is empty', () => {
            const globalQuery = new GlobalQuery();
            const results = queryTasks('not done', [], globalQuery);
            expect(results).toEqual([]);
        });

        it('should filter tasks by status (e.g. not done)', () => {
            const taskTodo = new TaskBuilder().description('Todo task').status(Status.TODO).build();
            const taskDone = new TaskBuilder().description('Done task').status(Status.DONE).build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('not done', [taskTodo, taskDone], globalQuery);

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Todo task');
        });

        it('should filter tasks by description', () => {
            const task1 = new TaskBuilder().description('Buy milk').build();
            const task2 = new TaskBuilder().description('Read book').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('description includes milk', [task1, task2], globalQuery);

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Buy milk');
        });

        it('should filter tasks by due date', () => {
            const taskDue = new TaskBuilder().description('Due soon').dueDate('2023-10-01').build();
            const taskNotDue = new TaskBuilder().description('No due date').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('has due date', [taskDue, taskNotDue], globalQuery);

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Due soon');
        });

        it('should sort tasks according to query instruction', () => {
            const taskA = new TaskBuilder().description('Apple').build();
            const taskB = new TaskBuilder().description('Banana').build();
            const taskC = new TaskBuilder().description('Cherry').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('sort by description reverse', [taskA, taskB, taskC], globalQuery);

            expect(results.map((t) => t.description)).toEqual(['Cherry', 'Banana', 'Apple']);
        });

        it('should apply limit to matching tasks', () => {
            const task1 = new TaskBuilder().description('Task 1').build();
            const task2 = new TaskBuilder().description('Task 2').build();
            const task3 = new TaskBuilder().description('Task 3').build();
            const task4 = new TaskBuilder().description('Task 4').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('limit 2', [task1, task2, task3, task4], globalQuery);

            expect(results).toHaveLength(2);
            expect(results.map((t) => t.description)).toEqual(['Task 1', 'Task 2']);
        });

        it('should apply sorting before limit', () => {
            const taskA = new TaskBuilder().description('Apple').build();
            const taskB = new TaskBuilder().description('Banana').build();
            const taskC = new TaskBuilder().description('Cherry').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('sort by description reverse\nlimit 2', [taskA, taskB, taskC], globalQuery);

            expect(results.map((t) => t.description)).toEqual(['Cherry', 'Banana']);
        });

        it('should handle comments, line continuations, and whitespace in query source', () => {
            const task1 = new TaskBuilder().description('Important meeting').build();
            const task2 = new TaskBuilder().description('Casual lunch').build();
            const globalQuery = new GlobalQuery();

            const querySource = ['# This is a comment', '', 'description includes \\', 'meeting', '   '].join('\n');

            const results = queryTasks(querySource, [task1, task2], globalQuery);

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Important meeting');
        });
    });

    describe('grouping and deduplication', () => {
        it('should deduplicate tasks that appear in multiple groups', () => {
            // A task with two tags will belong to two groups when grouped by tags
            const multiTagTask = new TaskBuilder().description('Multi-tag task').tags(['#apple', '#banana']).build();
            const singleTagTask = new TaskBuilder().description('Single-tag task').tags(['#apple']).build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('group by tags', [multiTagTask, singleTagTask], globalQuery);

            // multiTagTask appears in both '#apple' and '#banana' groups,
            // but queryTasks must return it only once
            expect(results).toHaveLength(2);
            const descriptions = results.map((t) => t.description);
            expect(descriptions).toContain('Multi-tag task #apple #banana');
            expect(descriptions).toContain('Single-tag task #apple');

            const multiTagMatches = results.filter((t) => t.originalMarkdown === multiTagTask.originalMarkdown);
            expect(multiTagMatches).toHaveLength(1);
        });

        it('should preserve sort order after flattening groups and deduplicating', () => {
            const task1 = new TaskBuilder().description('Beta').tags(['#tag1', '#tag2']).build();
            const task2 = new TaskBuilder().description('Alpha').tags(['#tag1']).build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('sort by description\ngroup by tags', [task1, task2], globalQuery);

            // Tasks within groups are sorted by description:
            // Group #tag1: Alpha, Beta
            // Group #tag2: Beta (deduplicated)
            expect(results.map((t) => t.description)).toEqual(['Alpha #tag1', 'Beta #tag1 #tag2']);
        });

        it('should respect limit groups instruction when tasks are grouped', () => {
            const task1 = new TaskBuilder().description('Task 1').tags(['#tag1']).build();
            const task2 = new TaskBuilder().description('Task 2').tags(['#tag1']).build();
            const task3 = new TaskBuilder().description('Task 3').tags(['#tag2']).build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('group by tags\nlimit groups 1', [task1, task2, task3], globalQuery);

            // Only 1 task from #tag1 group and 1 from #tag2 group
            expect(results).toHaveLength(2);
            expect(results.map((t) => t.description)).toEqual(['Task 1 #tag1', 'Task 3 #tag2']);
        });

        it('should produce group-major order when sorted and grouped, placing multi-tag tasks at earliest group', () => {
            // Group names: '#a' sorted before '#b'
            // task1 has tag '#b', due 2023-10-01 (earliest due date)
            // task2 has tag '#a', due 2023-10-10 (latest due date)
            // task3 has tags ['#a', '#b'], due 2023-10-05
            const task1 = new TaskBuilder().description('Only in B').tags(['#b']).dueDate('2023-10-01').build();
            const task2 = new TaskBuilder().description('Only in A').tags(['#a']).dueDate('2023-10-10').build();
            const task3 = new TaskBuilder()
                .description('In both A and B')
                .tags(['#a', '#b'])
                .dueDate('2023-10-05')
                .build();

            const globalQuery = new GlobalQuery();
            const results = queryTasks('sort by due\ngroup by tags', [task1, task2, task3], globalQuery);

            // Group '#a': task3 (Oct 5), task2 (Oct 10)
            // Group '#b': task1 (Oct 1), task3 (Oct 5 - deduplicated since already seen in group '#a')
            // Flattened group-major order: task3, task2, task1
            // Note that task2 (Oct 10) appears before task1 (Oct 1) because Group '#a' precedes Group '#b'.
            // Note that multi-tag task3 appears at its earliest group's position (Group '#a').
            expect(results.map((t) => t.description)).toEqual([
                'In both A and B #a #b',
                'Only in A #a',
                'Only in B #b',
            ]);
        });

        it('should order tasks in depth-first visual document order when multiple group levels are used', () => {
            const taskPWork = new TaskBuilder().description('Project Work').path('projects/work.md').build();
            const taskPHome = new TaskBuilder().description('Project Home').path('projects/home.md').build();
            const taskRWork = new TaskBuilder().description('Routine Work').path('routine/work.md').build();

            const globalQuery = new GlobalQuery();
            const results = queryTasks(
                'group by folder\ngroup by filename',
                [taskRWork, taskPWork, taskPHome],
                globalQuery,
            );

            // Level 1: 'projects/' then 'routine/' (alphabetical)
            // Level 2 within 'projects/': 'home' then 'work' (alphabetical)
            // Flattened depth-first order:
            // 1. projects/ -> home.md -> Project Home
            // 2. projects/ -> work.md -> Project Work
            // 3. routine/  -> work.md -> Routine Work
            expect(results.map((t) => t.description)).toEqual(['Project Home', 'Project Work', 'Routine Work']);
        });

        it('should cap tasks per group while returning tasks across all groups with limit groups', () => {
            const taskA1 = new TaskBuilder().description('A1').tags(['#groupA']).build();
            const taskA2 = new TaskBuilder().description('A2').tags(['#groupA']).build();
            const taskB1 = new TaskBuilder().description('B1').tags(['#groupB']).build();
            const taskB2 = new TaskBuilder().description('B2').tags(['#groupB']).build();

            const globalQuery = new GlobalQuery();
            const results = queryTasks(
                'group by tags\nlimit groups to 1 task',
                [taskA1, taskA2, taskB1, taskB2],
                globalQuery,
            );

            expect(results).toHaveLength(2);
            expect(results.map((t) => t.description)).toEqual(['A1 #groupA', 'B1 #groupB']);
        });
    });

    describe('global query honoring and ignoring', () => {
        it('should honor global query passed as argument', () => {
            const globalQuery = new GlobalQuery('path includes work');
            const workTask = new TaskBuilder().description('Work task').path('work/project.md').build();
            const homeTask = new TaskBuilder().description('Home task').path('home/chores.md').build();

            const results = queryTasks('not done', [workTask, homeTask], globalQuery);

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Work task');
        });

        it('should ignore global query when "ignore global query" instruction is present', () => {
            const globalQuery = new GlobalQuery('path includes work');
            const workTask = new TaskBuilder().description('Work task').path('work/project.md').build();
            const homeTask = new TaskBuilder().description('Home task').path('home/chores.md').build();

            const results = queryTasks('not done\nignore global query', [workTask, homeTask], globalQuery);

            expect(results).toHaveLength(2);
            expect(results.map((t) => t.description)).toContain('Work task');
            expect(results.map((t) => t.description)).toContain('Home task');
            // Tasks default sort orders by path: 'home/chores.md' before 'work/project.md'
            expect(results.map((t) => t.description)).toEqual(['Home task', 'Work task']);
        });

        it('should ignore invalid global query syntax when "ignore global query" is present', () => {
            const globalQuery = new GlobalQuery('invalid syntax global query instruction');
            const task = new TaskBuilder().description('Task').build();

            // Without ignore global query, invalid syntax throws
            expect(() => queryTasks('not done', [task], globalQuery)).toThrowError(/do not understand/i);

            // With ignore global query, invalid global query is skipped
            const results = queryTasks('not done\nignore global query', [task], globalQuery);
            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Task');
        });

        it('should throw when Global Query contains file placeholder even if querySource has no placeholders and tasksFile is not supplied', () => {
            const globalQuery = new GlobalQuery('path includes {{query.file.folder}}');
            const task = new TaskBuilder().description('Some task').build();

            expect(() => {
                queryTasks('not done', [task], globalQuery);
            }).toThrowError(/placeholder/i);
        });
    });

    describe('presets', () => {
        it('should expand preset defined in settings', () => {
            updateSettings({
                presets: {
                    my_filter: 'description includes important\nnot done',
                },
            });

            const task1 = new TaskBuilder().description('important meeting').build();
            const task2 = new TaskBuilder().description('trivial note').build();
            const task3 = new TaskBuilder().description('important old note').status(Status.DONE).build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('preset my_filter', [task1, task2, task3], globalQuery);

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('important meeting');
        });
    });

    describe('placeholders and tasksFile', () => {
        it('should expand placeholders when tasksFile is supplied', () => {
            const tasksFile = new TasksFile('work/projects/active.md');
            const matchingTask = new TaskBuilder().description('Project task').path('work/projects/active.md').build();
            const otherTask = new TaskBuilder().description('Other task').path('work/archive/old.md').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks(
                'path includes {{query.file.folder}}',
                [matchingTask, otherTask],
                globalQuery,
                tasksFile,
            );

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Project task');
        });

        it('should throw an error when placeholders are used without tasksFile', () => {
            const task = new TaskBuilder().description('Some task').build();
            const globalQuery = new GlobalQuery();

            expect(() => {
                queryTasks('path includes {{query.file.folder}}', [task], globalQuery);
            }).toThrowError(/placeholder/i);
        });

        it('should throw an error if placeholder references an invalid query.file property', () => {
            const task = new TaskBuilder().description('Some task').build();
            const tasksFile = new TasksFile('some/path.md');
            const globalQuery = new GlobalQuery();

            expect(() => {
                queryTasks('path includes {{query.file.nonExistentProperty}}', [task], globalQuery, tasksFile);
            }).toThrowError(/Unknown property: query.file.nonExistentProperty/);
        });

        it('should expand various file placeholders (path, filename, root, folder) when tasksFile is supplied', () => {
            const tasksFile = new TasksFile('projects/alpha/plan.md');
            const task1 = new TaskBuilder().description('Task 1').path('projects/alpha/plan.md').build();
            const task2 = new TaskBuilder().description('Task 2').path('other/file.md').build();
            const globalQuery = new GlobalQuery();

            // query.file.path
            expect(
                queryTasks('path includes {{query.file.path}}', [task1, task2], globalQuery, tasksFile),
            ).toHaveLength(1);
            // query.file.filename
            expect(
                queryTasks('path includes {{query.file.filename}}', [task1, task2], globalQuery, tasksFile),
            ).toHaveLength(1);
            // query.file.root
            expect(
                queryTasks('path includes {{query.file.root}}', [task1, task2], globalQuery, tasksFile),
            ).toHaveLength(1);
            // query.file.filenameWithoutExtension
            expect(
                queryTasks(
                    'path includes {{query.file.filenameWithoutExtension}}',
                    [task1, task2],
                    globalQuery,
                    tasksFile,
                ),
            ).toHaveLength(1);
        });

        it('should support script filters accessing query.file when tasksFile is supplied', () => {
            const tasksFile = new TasksFile('notes/active.md');
            const matchingTask = new TaskBuilder().description('Matching').path('notes/active.md').build();
            const nonMatchingTask = new TaskBuilder().description('Non-matching').path('notes/other.md').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks(
                'filter by function task.file.path === query.file.path',
                [matchingTask, nonMatchingTask],
                globalQuery,
                tasksFile,
            );

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Matching');
        });

        it('should support script filters accessing frontmatter properties via query.file.property', () => {
            const cachedMetadata: CachedMetadata = {
                frontmatter: {
                    project: 'alpha',
                },
            };
            registerMockMetadata(cachedMetadata, 'notes/active.md');
            const tasksFile = new TasksFile('notes/active.md', cachedMetadata);
            const task1 = new TaskBuilder().description('Project task').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks(
                'filter by function query.file.hasProperty("project") && query.file.property("project") === "alpha"',
                [task1],
                globalQuery,
                tasksFile,
            );

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Project task');
        });
    });

    describe('error handling for invalid syntax, invalid inputs, and runtime search errors', () => {
        it('should throw Error when query syntax is invalid', () => {
            const task = new TaskBuilder().description('Some task').build();
            const globalQuery = new GlobalQuery();

            expect(() => {
                queryTasks('invalid instruction xyz 123', [task], globalQuery);
            }).toThrowError(/do not understand/i);
        });

        it('should throw Error when querySource is not a string', () => {
            const task = new TaskBuilder().description('Some task').build();
            const globalQuery = new GlobalQuery();

            expect(() => {
                queryTasks(123 as unknown as string, [task], globalQuery);
            }).toThrow('queryTasks: querySource must be a string');

            expect(() => {
                queryTasks(null as unknown as string, [task], globalQuery);
            }).toThrow('queryTasks: querySource must be a string');

            expect(() => {
                queryTasks(undefined as unknown as string, [task], globalQuery);
            }).toThrow('queryTasks: querySource must be a string');

            expect(() => {
                queryTasks({} as unknown as string, [task], globalQuery);
            }).toThrow('queryTasks: querySource must be a string');
        });

        it('should throw Error including problem line when filter by function fails at runtime', () => {
            const task = new TaskBuilder().description('Some task').build();
            const globalQuery = new GlobalQuery();

            expect(() => {
                queryTasks('filter by function nonExistentFunction()', [task], globalQuery);
            }).toThrowError(/Search failed/i);

            expect(() => {
                queryTasks('filter by function nonExistentFunction()', [task], globalQuery);
            }).toThrowError(/Problem line: "filter by function nonExistentFunction\(\)"/);

            // Multi-line query pinning the exact failing statement among valid instructions
            const multiLineQuery = ['not done', 'filter by function nonExistentFunction()', 'sort by due'].join('\n');
            expect(() => {
                queryTasks(multiLineQuery, [task], globalQuery);
            }).toThrowError(/Problem line: "filter by function nonExistentFunction\(\)"/);
        });
    });

    describe('immutability of returned ReadOnlyTask objects', () => {
        it('should return frozen ReadOnlyTask objects and frozen nested structures', () => {
            const task = new TaskBuilder().description('Freeze check').tags(['#test']).dueDate('2023-10-01').build();
            const globalQuery = new GlobalQuery();

            const results = queryTasks('not done', [task], globalQuery);

            expect(results).toHaveLength(1);
            const readOnly = results[0];

            expect(Object.isFrozen(readOnly)).toBe(true);
            expect(Object.isFrozen(readOnly.status)).toBe(true);
            expect(Object.isFrozen(readOnly.tags)).toBe(true);
            expect(Object.isFrozen(readOnly.dependsOn)).toBe(true);

            expect(() => {
                (readOnly as any).description = 'mutated';
            }).toThrow();

            expect(() => {
                (readOnly.status as any).indicator = '!';
            }).toThrow();

            expect(() => {
                (readOnly.tags as any).push('#hacked');
            }).toThrow();
        });
    });
});
