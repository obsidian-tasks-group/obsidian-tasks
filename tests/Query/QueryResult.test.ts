import { TaskGroups } from '../../src/Query/Group/TaskGroups';
import type { Grouper } from '../../src/Query/Group/Grouper';
import type { Task } from '../../src/Task/Task';
import { QueryResult } from '../../src/Query/QueryResult';
import { fromLine } from '../TestingTools/TestHelpers';
import { SearchInfo } from '../../src/Query/SearchInfo';

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
