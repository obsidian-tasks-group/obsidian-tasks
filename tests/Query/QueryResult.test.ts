import { TaskGroups } from '../../src/Query/TaskGroups';
import type { Grouper } from '../../src/Query/Grouper';
import type { Task } from '../../src/Task';
import { QueryResult } from '../../src/Query/QueryResult';
import { fromLine } from '../TestHelpers';

describe('QueryResult', () => {
    function createUngroupedQueryResult(tasks: Task[]) {
        const groupers: Grouper[] = [];
        const groups = new TaskGroups(groupers, tasks);
        return new QueryResult(groups);
    }

    it('should create a QueryResult from TaskGroups', () => {
        // Arrange
        const groupers: Grouper[] = [];
        const tasks: Task[] = [];
        const groups = new TaskGroups(groupers, tasks);

        // Act
        const queryResult = new QueryResult(groups);

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
    });
});
