/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { FilenameField } from '../../../src/Query/Filter/FilenameField';
import { Grouper, type GrouperFunction } from '../../../src/Query/Group/Grouper';
import type { Task } from '../../../src/Task/Task';
import { PathField } from '../../../src/Query/Filter/PathField';
import { TagsField } from '../../../src/Query/Filter/TagsField';
import { FolderField } from '../../../src/Query/Filter/FolderField';
import { TaskGroups } from '../../../src/Query/Group/TaskGroups';
import { StatusTypeField } from '../../../src/Query/Filter/StatusTypeField';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import { fromLine } from '../../TestingTools/TestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

function makeTasksGroups(grouping: Grouper[], inputs: Task[]): any {
    return new TaskGroups(grouping, inputs, SearchInfo.fromAllTasks(inputs));
}

describe('Grouping tasks', () => {
    it('groups correctly by path', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a', path: 'file2.md' });
        const b = fromLine({ line: '- [ ] b', path: 'file1.md' });
        const c = fromLine({ line: '- [ ] c', path: 'file1.md' });
        const inputs = [a, b, c];

        // Act
        const grouping = [new PathField().createNormalGrouper()];
        const groups = makeTasksGroups(grouping, inputs);

        // Assert
        expect(groups.groupers).toStrictEqual(grouping);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - path

            Group names: [file1]
            #### [path] file1
            - [ ] b
            - [ ] c

            ---

            Group names: [file2]
            #### [path] file2
            - [ ] a

            ---

            3 tasks
            "
        `);
    });

    it('groups correctly by default grouping', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a 📅 1970-01-01', path: '2.md' });
        const b = fromLine({ line: '- [ ] b 📅 1970-01-02', path: '3.md' });
        const c = fromLine({ line: '- [ ] c 📅 1970-01-02', path: '3.md' });
        const inputs = [a, b, c];

        // Act
        const grouping: Grouper[] = [];
        const groups = makeTasksGroups(grouping, inputs);

        // Assert
        // No grouping specified, so no headings generated
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):

            Group names: []
            - [ ] a 📅 1970-01-01
            - [ ] b 📅 1970-01-02
            - [ ] c 📅 1970-01-02

            ---

            3 tasks
            "
        `);
    });

    it('groups empty task list correctly', () => {
        // Arrange
        const inputs: Task[] = [];
        const grouping = [new PathField().createNormalGrouper()];

        // Act
        const groups = makeTasksGroups(grouping, inputs);

        // Assert
        expect(groups.groups.length).toEqual(1);
        expect(groups.groups[0].groups.length).toEqual(0);
        expect(groups.groups[0].tasks.length).toEqual(0);
    });

    it('should provide access to SearchInfo', () => {
        // Arrange
        const groupByQueryPath: GrouperFunction = (_task: Task, searchInfo: SearchInfo) => {
            return [searchInfo.queryPath ? searchInfo.queryPath : 'No SearchInfo'];
        };
        const grouper: Grouper = new Grouper('group by test', 'test', groupByQueryPath, false);

        const filename = 'somewhere/anything.md';
        const tasks = [new TaskBuilder().build()];
        const searchInfo = new SearchInfo(filename, tasks);

        // Act
        const groups = new TaskGroups([grouper], tasks, searchInfo);

        // Assert
        expect(groups.groups.length).toEqual(1);
        expect(groups.groups[0].groups).toEqual([filename]);
    });

    it('sorts group names correctly', () => {
        const a = fromLine({
            line: '- [ ] third file path',
            path: 'd/e/f.md',
        });
        const b = fromLine({
            line: '- [ ] second file path',
            path: 'b/c/d.md',
        });
        const c = fromLine({
            line: '- [ ] first file path, alphabetically',
            path: 'a/b/c.md',
        });
        const inputs = [a, b, c];

        const grouping = [new PathField().createNormalGrouper()];
        const groups = makeTasksGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - path

            Group names: [a/b/c]
            #### [path] a/b/c
            - [ ] first file path, alphabetically

            ---

            Group names: [b/c/d]
            #### [path] b/c/d
            - [ ] second file path

            ---

            Group names: [d/e/f]
            #### [path] d/e/f
            - [ ] third file path

            ---

            3 tasks
            "
        `);
    });

    it('sorts group names beginning with numeric values correctly', () => {
        const a = fromLine({
            line: '- [ ] first, as 9 is less then 10',
            path: '9 something.md',
        });
        const b = fromLine({
            line: '- [ ] second, as 10 is more than 9',
            path: '10 something.md',
        });
        const inputs = [a, b];

        const grouping = [new FilenameField().createNormalGrouper()];
        const groups = makeTasksGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - filename

            Group names: [[[9 something]]]
            #### [filename] [[9 something]]
            - [ ] first, as 9 is less then 10

            ---

            Group names: [[[10 something]]]
            #### [filename] [[10 something]]
            - [ ] second, as 10 is more than 9

            ---

            2 tasks
            "
        `);
    });

    it('sorts due date group headings in reverse', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a 📅 2023-04-05', path: '2.md' });
        const b = fromLine({ line: '- [ ] b 📅 2023-07-08', path: '3.md' });
        const inputs = [a, b];

        // Act
        const grouping: Grouper[] = [new DueDateField().createGrouperFromLine('group by due reverse')!];
        const groups = makeTasksGroups(grouping, inputs);

        // Assert
        // No grouping specified, so no headings generated
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - due reverse

            Group names: [2023-07-08 Saturday]
            #### [due] 2023-07-08 Saturday
            - [ ] b 📅 2023-07-08

            ---

            Group names: [2023-04-05 Wednesday]
            #### [due] 2023-04-05 Wednesday
            - [ ] a 📅 2023-04-05

            ---

            2 tasks
            "
        `);
    });

    it('handles tasks matching multiple groups correctly', () => {
        const a = fromLine({
            line: '- [ ] Task 1 #group1',
        });
        const b = fromLine({
            line: '- [ ] Task 2 #group2 #group1',
        });
        const c = fromLine({
            line: '- [ ] Task 3 #group2',
        });
        const inputs = [a, b, c];

        const grouping = [new TagsField().createNormalGrouper()];
        const groups = makeTasksGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - tags

            Group names: [#group1]
            #### [tags] #group1
            - [ ] Task 1 #group1
            - [ ] Task 2 #group2 #group1

            ---

            Group names: [#group2]
            #### [tags] #group2
            - [ ] Task 2 #group2 #group1
            - [ ] Task 3 #group2

            ---

            3 tasks
            "
        `);
    });

    it('should retain tasks with no group name', () => {
        const a = fromLine({
            line: '- [ ] Task with a tag #group1',
        });
        const b = fromLine({
            line: '- [ ] Task without a tag',
        });
        const inputs = [a, b];

        const groupByTags: GrouperFunction = (task: Task) => task.tags;
        const grouper = new Grouper('group by custom tag grouper', 'custom tag grouper', groupByTags, false);
        const groups = makeTasksGroups([grouper], inputs);

        expect(groups.totalTasksCount()).toEqual(2);

        // Force a recalculation of the task count, to ensure no
        // tasks were lost in the grouping:
        groups.recalculateTotalTaskCount();
        expect(groups.totalTasksCount()).toEqual(2);

        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - custom tag grouper

            Group names: []
            - [ ] Task without a tag

            ---

            Group names: [#group1]
            #### [custom tag grouper] #group1
            - [ ] Task with a tag #group1

            ---

            2 tasks
            "
        `);
    });

    it('should create nested headings if multiple groups used even if one is reversed', () => {
        // Arrange
        const t1 = fromLine({
            line: '- [ ] Task 1 - but path is 2nd, alphabetically',
            path: 'folder_b/folder_c/file_c.md',
        });
        const t2 = fromLine({
            line: '- [ ] Task 2 - but path is 2nd, alphabetically',
            path: 'folder_b/folder_c/file_d.md',
        });
        const t3 = fromLine({
            line: '- [ ] Task 3 - but path is 1st, alphabetically',
            path: 'folder_a/folder_b/file_c.md',
        });
        const tasks = [t1, t2, t3];

        const grouping: Grouper[] = [
            new FolderField().createReverseGrouper(),
            new FilenameField().createNormalGrouper(),
        ];

        // Act
        const groups = makeTasksGroups(grouping, tasks);

        // Assert
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - folder reverse
            - filename

            Group names: [folder\\_b/folder\\_c/,[[file_c]]]
            #### [folder] folder\\_b/folder\\_c/
            ##### [filename] [[file_c]]
            - [ ] Task 1 - but path is 2nd, alphabetically

            ---

            Group names: [folder\\_b/folder\\_c/,[[file_d]]]
            ##### [filename] [[file_d]]
            - [ ] Task 2 - but path is 2nd, alphabetically

            ---

            Group names: [folder\\_a/folder\\_b/,[[file_c]]]
            #### [folder] folder\\_a/folder\\_b/
            ##### [filename] [[file_c]]
            - [ ] Task 3 - but path is 1st, alphabetically

            ---

            3 tasks
            "
        `);
    });

    it('should create nested headings if multiple groups used - case 2', () => {
        const b = fromLine({
            line: '- [ ] Task a - early date 📅 2022-09-19',
        });
        const a = fromLine({
            line: '- [ ] Task b - later date ⏳ 2022-12-06',
        });
        const c = fromLine({
            line: '- [ ] Task c - intermediate date ⏳ 2022-10-06',
        });
        const inputs = [a, b, c];

        const grouping = [
            new StatusTypeField().createNormalGrouper(), // Two group levels
            new HappensDateField().createNormalGrouper(),
        ];
        const groups = makeTasksGroups(grouping, inputs);
        // This result is incorrect. The '2 TODO' heading is shown before
        // the last group instead of before the first one.
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - status.type
            - happens

            Group names: [%%2%%TODO,2022-09-19 Monday]
            #### [status.type] %%2%%TODO
            ##### [happens] 2022-09-19 Monday
            - [ ] Task a - early date 📅 2022-09-19

            ---

            Group names: [%%2%%TODO,2022-10-06 Thursday]
            ##### [happens] 2022-10-06 Thursday
            - [ ] Task c - intermediate date ⏳ 2022-10-06

            ---

            Group names: [%%2%%TODO,2022-12-06 Tuesday]
            ##### [happens] 2022-12-06 Tuesday
            - [ ] Task b - later date ⏳ 2022-12-06

            ---

            3 tasks
            "
        `);
    });

    it('should limit tasks in each group (no task overlapping across group)', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a', path: 'tasks_under_the_limit.md' });
        const b = fromLine({ line: '- [ ] b', path: 'tasks_equal_to_limit.md' });
        const c = fromLine({ line: '- [ ] c', path: 'tasks_equal_to_limit.md' });
        const d = fromLine({ line: '- [ ] d', path: 'tasks_over_the_limit.md' });
        const e = fromLine({ line: '- [ ] e', path: 'tasks_over_the_limit.md' });
        const f = fromLine({ line: '- [ ] f', path: 'tasks_over_the_limit.md' });
        const inputs = [a, b, c, d, e, f];

        // Act
        const grouping = [new PathField().createNormalGrouper()];
        const groups = makeTasksGroups(grouping, inputs);
        groups.applyTaskLimit(2);

        // Assert
        expect(groups.totalTasksCount()).toEqual(5);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - path

            Group names: [tasks\\_equal\\_to\\_limit]
            #### [path] tasks\\_equal\\_to\\_limit
            - [ ] b
            - [ ] c

            ---

            Group names: [tasks\\_over\\_the\\_limit]
            #### [path] tasks\\_over\\_the\\_limit
            - [ ] d
            - [ ] e

            ---

            Group names: [tasks\\_under\\_the\\_limit]
            #### [path] tasks\\_under\\_the\\_limit
            - [ ] a

            ---

            5 tasks
            "
        `);
    });

    it('should limit tasks with tasks that overlap across multiple groups and correctly calculate unique tasks', () => {
        // Arrange
        const taskA = fromLine({ line: '- [ ] task A #tag1 #tag2' });
        const taskB = fromLine({ line: '- [ ] task B #tag1 #tag3' });
        const taskC = fromLine({ line: '- [ ] task C #tag3 #tag2' });
        const taskD = fromLine({ line: '- [ ] task D #tag1 #tag2' });
        const inputs = [taskA, taskB, taskC, taskD];

        // Act
        const grouping = [new TagsField().createNormalGrouper()];
        const groups = makeTasksGroups(grouping, inputs);
        groups.applyTaskLimit(1);

        // Assert
        expect(groups.totalTasksCount()).toEqual(2);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - tags

            Group names: [#tag1]
            #### [tags] #tag1
            - [ ] task A #tag1 #tag2

            ---

            Group names: [#tag2]
            #### [tags] #tag2
            - [ ] task A #tag1 #tag2

            ---

            Group names: [#tag3]
            #### [tags] #tag3
            - [ ] task B #tag1 #tag3

            ---

            2 tasks
            "
        `);
    });

    it('should not limit tasks if no groups were specified', () => {
        // Arrange
        const taskA = fromLine({ line: '- [ ] task A' });
        const taskB = fromLine({ line: '- [ ] task B' });
        const taskC = fromLine({ line: '- [ ] task C' });
        const taskD = fromLine({ line: '- [ ] task D' });
        const inputs = [taskA, taskB, taskC, taskD];

        // Act
        const grouping: Grouper[] = [];
        const groups = makeTasksGroups(grouping, inputs);
        groups.applyTaskLimit(1);

        // Assert
        expect(groups.totalTasksCount()).toEqual(4);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):

            Group names: []
            - [ ] task A
            - [ ] task B
            - [ ] task C
            - [ ] task D

            ---

            4 tasks
            "
        `);
    });
});
