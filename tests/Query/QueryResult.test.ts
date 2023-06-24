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
    });
});
