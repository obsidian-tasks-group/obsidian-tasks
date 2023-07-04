import { TaskGroups } from '../../src/Query/TaskGroups';
import type { Grouper } from '../../src/Query/Grouper';
import type { Task } from '../../src/Task';
import { QueryResult } from '../../src/Query/QueryResult';

describe('QueryResult', () => {
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
});
