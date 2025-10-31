/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import type { Grouper } from '../../src/Query/Group/Grouper';
import { TaskGroups } from '../../src/Query/Group/TaskGroups';
import { Query } from '../../src/Query/Query';
import { QueryResult } from '../../src/Query/QueryResult';
import { SearchInfo } from '../../src/Query/SearchInfo';
import type { Task } from '../../src/Task/Task';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { fromLine, fromLines } from '../TestingTools/TestHelpers';

window.moment = moment;

describe('QueryResult', () => {
    function createUngroupedQueryResult(tasks: Task[]) {
        return createUngroupedQueryResultWithLimit(tasks, tasks.length);
    }

    function createUngroupedQueryResultWithLimit(tasks: Task[], totalTasksCountBeforeLimit: number) {
        const groupers: Grouper[] = [];
        const groups = new TaskGroups(groupers, tasks, SearchInfo.fromAllTasks(tasks));
        return new QueryResult(groups, totalTasksCountBeforeLimit);
    }

    it('should create a QueryResult from TaskGroups', () => {
        // Arrange
        const groupers: Grouper[] = [];
        const tasks: Task[] = [];
        const groups = new TaskGroups(groupers, tasks, SearchInfo.fromAllTasks(tasks));

        // Act
        const queryResult = new QueryResult(groups, 0);

        // Assert
        expect(queryResult.totalTasksCount).toEqual(0);
        expect(queryResult.groups).toEqual(groups.groups);
        expect(queryResult.searchErrorMessage).toBeUndefined();
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
            const tasks = [
                fromLine({ line: '- [ ] Do something more complicated 1' }),
                fromLine({ line: '- [ ] Do something more complicated 2' }),
            ];
            const queryResult = createUngroupedQueryResult(tasks);
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
            const tasks = [
                fromLine({ line: '- [ ] Do something more complicated 1' }),
                fromLine({ line: '- [ ] Do something more complicated 2' }),
            ];
            const queryResult = createUngroupedQueryResultWithLimit(tasks, 9);
            expect(queryResult.totalTasksCountDisplayText()).toEqual('2 of 9 tasks');
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

        expect(searchMarkdownAndCopyResult(tasks, query)).toEqual(`
#### 3

- [ ] 333

#### 4

- [ ] 4444

#### 5

- [ ] 55555
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

        expect(searchMarkdownAndCopyResult(tasks, query)).toEqual(`
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
