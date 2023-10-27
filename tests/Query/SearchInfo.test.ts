import { SearchInfo } from '../../src/Query/SearchInfo';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

describe('SearchInfo', () => {
    it('should not be able to modify the tasks in SearchInfo.allTasks directly', () => {
        const tasks = [new TaskBuilder().build()];
        const searchInfo = new SearchInfo(tasks);
        expect(searchInfo.allTasks.length).toEqual(1);

        // Success: Does not compile
        // searchInfo.allTasks.push(new TaskBuilder().description('I should not be allowed').build());

        // Success: Does not compile
        // searchInfo.allTasks[0] = new TaskBuilder().description('cannot replace a task').build();
    });

    it.failing('should not be able to modify the tasks in SearchInfo.allTasks indirectly', () => {
        const tasks = [new TaskBuilder().build()];
        const searchInfo = new SearchInfo(tasks);

        // Check that updating the original list of tasks does not change the tasks saved in searchInfo.allTasks
        tasks.push(new TaskBuilder().description('I should not be added to searchInfo.allTasks').build());
        expect(searchInfo.allTasks.length).toEqual(1);
    });
});
