/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import { DescriptionField } from '../../src/Query/Filter/DescriptionField';
import { TagsField } from '../../src/Query/Filter/TagsField';
import type { Grouper } from '../../src/Query/Group/Grouper';
import { TaskGroups } from '../../src/Query/Group/TaskGroups';
import { Query } from '../../src/Query/Query';
import { QueryResult } from '../../src/Query/QueryResult';
import { SearchInfo } from '../../src/Query/SearchInfo';
import type { Task } from '../../src/Task/Task';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { renderMarkdown } from '../Renderer/RenderingTestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { fromLine, fromLines } from '../TestingTools/TestHelpers';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import { FunctionField } from '../../src/Query/Filter/FunctionField';

window.moment = moment;

describe('QueryResult', () => {
    function createUngroupedQueryResult(tasks: Task[]) {
        return createUngroupedQueryResultWithLimit(tasks, tasks.length);
    }

    function createUngroupedQueryResultWithLimit(tasks: Task[], totalTasksCountBeforeLimit: number) {
        const groupers: Grouper[] = [];
        const groups = new TaskGroups(groupers, tasks, SearchInfo.fromAllTasks(tasks));
        return new QueryResult(groups, totalTasksCountBeforeLimit, undefined);
    }

    it('should create a QueryResult from TaskGroups', () => {
        // Arrange
        const groupers: Grouper[] = [];
        const tasks: Task[] = [];
        const groups = new TaskGroups(groupers, tasks, SearchInfo.fromAllTasks(tasks));

        // Act
        const queryResult = new QueryResult(groups, 0, undefined);

        // Assert
        expect(queryResult.totalTasksCount).toEqual(0);
        expect(queryResult.groups).toEqual(groups.groups);
        expect(queryResult.searchErrorMessage).toBeUndefined();
    });

    it('should preserve search-time errors', () => {
        const query = new Query('sort by function task.linenumer');
        expect(query.error).toBeUndefined();

        const queryResult = query.applyQueryToTasks([
            new TaskBuilder().description('first').build(),
            new TaskBuilder().description('second').build(),
        ]);
        expect(queryResult.searchErrorMessage).toContain(
            'Error: "undefined" is not a valid sort key: while evaluating instruction \'sort by function task.linenumer\'',
        );

        const { filter } = new DescriptionField().createFilterOrErrorMessage('description includes anything');
        expect(filter).toBeDefined();

        const filteredResult = queryResult.applyFilter(filter!);
        expect(filteredResult.searchErrorMessage).toContain(
            'Error: "undefined" is not a valid sort key: while evaluating instruction \'sort by function task.linenumer\'',
        );
    });

    it('should preserve query file properties when filtering results', () => {
        const queryFile = getTasksFileFromMockData('docs_sample_for_task_properties_reference');
        expect(queryFile.property('sample_date_and_time_property')).toEqual('2024-07-21T12:37:00');

        // Based on the query in issue #3774
        const query = new Query(
            'group by function query.file.property("sample_date_and_time_property") ?? "no date"',
            queryFile,
        );

        const getFirstGroupName = (result: QueryResult): string => result.taskGroups.groups[0].groups[0];

        // Do an initial search:
        const queryResult = query.applyQueryToTasks([new TaskBuilder().build()]);
        expect(getFirstGroupName(queryResult)).toEqual('2024-07-21T12:37:00');

        // Simulate a user entering a search string in the Toolbar filter box:
        const { filter } = new FunctionField().createFilterOrErrorMessage('filter by function true');
        expect(filter).toBeDefined();

        // Confirm that the properties in the query file are retained in the filtered results:
        const filteredResult = queryResult.applyFilter(filter!);
        expect(getFirstGroupName(filteredResult)).toEqual('2024-07-21T12:37:00');
    });

    it('should be able to store an error message if the search fails', () => {
        // Arrange, Act:
        const message = 'I did not work';
        const result = QueryResult.fromError(message);

        // Assert
        expect(result.searchErrorMessage).toEqual(message);
        expect(result.taskGroups.totalTasksCount()).toEqual(0);
    });

    describe('Text representation of tasks count', () => {
        const twoMoreComplicatedTasks = [
            fromLine({ line: '- [ ] Do something more complicated 1' }),
            fromLine({ line: '- [ ] Do something more complicated 2' }),
        ];

        // Simple cases - where no limit was applied

        it('should pluralise "tasks" if 0 matches', () => {
            const tasks: Task[] = [];
            const queryResult = createUngroupedQueryResult(tasks);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('0 tasks');
            expect(queryResult.asMarkdown()).toEqual(`
`);
        });

        it('should not pluralise "task" if only 1 match', () => {
            const tasks = [fromLine({ line: '- [ ] Do something' })];
            const queryResult = createUngroupedQueryResult(tasks);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('1 task');
        });

        it('should pluralise "tasks" if 2 matches', () => {
            const queryResult = createUngroupedQueryResult(twoMoreComplicatedTasks);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('2 tasks');
            expect(queryResult.asMarkdown()).toEqual(`
- [ ] Do something more complicated 1
- [ ] Do something more complicated 2
`);
        });

        // Cases where a limit was applied

        it('should show original number of matching tasks if limit was applied', () => {
            const tasks: Task[] = [];
            const queryResult = createUngroupedQueryResultWithLimit(tasks, 1);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('0 of 1 task');
        });

        it('should show original number of matching tasks if limit was applied', () => {
            const tasks = [fromLine({ line: '- [ ] Do something' })];
            const queryResult = createUngroupedQueryResultWithLimit(tasks, 2);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('1 of 2 tasks');
        });

        it('should show original number of matching tasks if limit was applied', () => {
            const queryResult = createUngroupedQueryResultWithLimit(twoMoreComplicatedTasks, 9);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('2 of 9 tasks');
        });

        it('should retain original number of matching tasks if filter applied after limit exceeded', () => {
            // See issue #3724
            const queryResult = createUngroupedQueryResultWithLimit(twoMoreComplicatedTasks, 9);
            const filteredResult = queryResult.applyFilter(
                new DescriptionField().createFilterOrErrorMessage('description includes some').filter!,
            );

            expect(filteredResult.totalTasksCountDisplayText()).toEqual('2 of 9 tasks');
        });
    });
});

describe('Copying results', () => {
    function searchTasksAndCopyResult(tasks: Task[], query: string) {
        const queryResult = new Query(query).applyQueryToTasks(tasks);
        return queryResult.asMarkdown();
    }

    function searchMarkdownAndCopyResult(tasksMarkdown: string, query: string) {
        const lines = tasksMarkdown.split('\n').filter((line) => line.length > 0);
        const tasks = fromLines({ lines });
        return searchTasksAndCopyResult(tasks, query);
    }

    it('should copy one grouping level', () => {
        const tasks = `
- [ ] 4444
- [ ] 333
- [ ] 55555
`;

        const query = 'group by function task.description.length';

        expect(searchMarkdownAndCopyResult(tasks, query)).toMatchInlineSnapshot(`
            "
            #### 3

            - [ ] 333

            #### 4

            - [ ] 4444

            #### 5

            - [ ] 55555
            "
        `);
    });

    it('should copy four grouping levels', () => {
        const tasks = `
- [ ] 1 ⏳ 2025-10-29
- [ ] 2 ⏬
- [ ] 3 ⏫ ⏳ 2025-10-30
- [ ] 4 ⏳ 2025-10-29
- [ ] 5 #something
- [ ] 6 🆔 id6
`;

        const query = `
group by function task.tags.join(',')
group by priority
group by scheduled
group by id
`;

        expect(searchMarkdownAndCopyResult(tasks, query)).toMatchInlineSnapshot(`
            "
            ##### %%1%%High priority

            ###### 2025-10-30 Thursday

            - [ ] 3 ⏫ ⏳ 2025-10-30

            ##### %%3%%Normal priority

            ###### 2025-10-29 Wednesday

            - [ ] 1 ⏳ 2025-10-29
            - [ ] 4 ⏳ 2025-10-29

            ###### No scheduled date

            ###### id6

            - [ ] 6 🆔 id6

            ##### %%5%%Lowest priority

            ###### No scheduled date

            - [ ] 2 ⏬

            #### #something

            ##### %%3%%Normal priority

            ###### No scheduled date

            - [ ] 5 #something
            "
        `);
    });

    it('should remove indentation for nested tasks', () => {
        const tasks = readTasksFromSimulatedFile('inheritance_2roots_listitem_listitem_task');

        const query = '';

        expect(searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] grandchild task 1
- [ ] grandchild task 2
`);
    });

    it.failing('should indent nested tasks', () => {
        const tasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );

        const query = '';

        expect(searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] #task parent task
    - [ ] #task child task 1
        - [ ] #task grandchild 1
    - [ ] #task child task 2
        - [ ] #task grandchild 2
- [ ] #task sibling
`);
    });

    it('should use hyphen as list marker', () => {
        const tasks = readTasksFromSimulatedFile('mixed_list_markers');

        const query = '';

        expect(searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] hyphen
- [ ] asterisk
- [ ] plus
- [ ] numbered task
`);
    });

    it('should remove callout prefixes', () => {
        const tasks = readTasksFromSimulatedFile('callout_labelled');

        const query = '';

        expect(searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] #task Task in 'callout_labelled'
- [ ] #task Task indented in 'callout_labelled'
`);
    });
});

describe('QueryResult - filters', () => {
    const taskBuilder = new TaskBuilder();
    const threeSimpleTasks = [
        taskBuilder.description('task 1').build(),
        taskBuilder.description('task 2').build(),
        taskBuilder.description('task 3').build(),
    ];

    it('should filter an ungrouped flat list result', async () => {
        const { markdown, rerenderWithFilter } = await renderMarkdown(
            'description does not include 3',
            threeSimpleTasks,
        );

        expect(markdown).toEqual(`
- [ ] task 1
- [ ] task 2
`);

        const filter = new DescriptionField().createFilterOrErrorMessage('description includes 2');

        const { filteredMarkdown } = await rerenderWithFilter(filter);

        expect(filteredMarkdown).toEqual(`
- [ ] task 2
`);
    });

    it('should filter a grouped flat list result', async () => {
        const { markdown, rerenderWithFilter } = await renderMarkdown(
            'group by function task.description',
            threeSimpleTasks,
        );

        expect(markdown).toEqual(`
#### task 1

- [ ] task 1

#### task 2

- [ ] task 2

#### task 3

- [ ] task 3
`);

        const filter = new DescriptionField().createFilterOrErrorMessage('description includes 2');

        const { filteredMarkdown } = await rerenderWithFilter(filter);

        expect(filteredMarkdown).toEqual(`
#### task 2

- [ ] task 2
`);
    });

    it('should filter a grouped flat list result with a task in multiple groups', async () => {
        const taskBuilder = new TaskBuilder();
        const task1 = taskBuilder.description('task 1').tags(['#one', '#two']).build();
        const task2 = taskBuilder.description('task 2').tags(['#three']).build();
        const tasks = [task1, task2];

        const { markdown, rerenderWithFilter } = await renderMarkdown('group by tags', tasks);

        expect(markdown).toEqual(`
#### #one

- [ ] task 1 #one #two

#### #three

- [ ] task 2 #three

#### #two

- [ ] task 1 #one #two
`);

        const filter = new TagsField().createFilterOrErrorMessage('tag includes two');

        const { filteredMarkdown } = await rerenderWithFilter(filter);

        expect(filteredMarkdown).toEqual(`
#### #one

- [ ] task 1 #one #two

#### #two

- [ ] task 1 #one #two
`);
    });
});
