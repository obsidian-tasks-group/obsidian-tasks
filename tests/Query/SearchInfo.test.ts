import { SearchInfo } from '../../src/Query/SearchInfo';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

describe('SearchInfo', () => {
    it('should not be able to modify the tasks in SearchInfo.allTasks', () => {
        const tasks = [new TaskBuilder().build()];
        const searchInfo = new SearchInfo(tasks);
        expect(searchInfo.allTasks.length).toEqual(1);

        // Success: Does not compile
        // searchInfo.allTasks.push(new TaskBuilder().description('I should not be allowed').build());

        // Success: Does not compile
        // searchInfo.allTasks[0] = new TaskBuilder().description('cannot replace a task').build();
    });
});
