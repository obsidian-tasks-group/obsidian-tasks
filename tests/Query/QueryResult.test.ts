import { TaskGroups } from '../../src/Query/TaskGroups';
import type { Grouper } from '../../src/Query/Grouper';
import type { Task } from '../../src/Task';
import { QueryResult } from '../../src/Query/QueryResult';

describe('QueryResult', () => {
    it('should create a QueryResult from TaskGroups', () => {
        const groupers: Grouper[] = [];
        const tasks: Task[] = [];
        const groups = new TaskGroups(groupers, tasks);
        const queryResult = new QueryResult(groups);
        expect(queryResult.groups.totalTasksCount()).toEqual(0);
    });
});
