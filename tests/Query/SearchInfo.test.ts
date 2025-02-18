import { SearchInfo } from '../../src/Query/SearchInfo';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { TasksFile } from '../../src/Scripting/TasksFile';

describe('SearchInfo', () => {
    const path = 'a/b/c.md';
    const tasksFile = new TasksFile(path);

    it('should not be able to modify SearchInfo.allTasks directly', () => {
        const tasks = [new TaskBuilder().build()];
        const searchInfo = SearchInfo.fromAllTasks(tasks);
        expect(searchInfo.allTasks.length).toEqual(1);

        // Success: Does not compile
        // searchInfo.allTasks.push(new TaskBuilder().description('I should not be allowed').build());

        // Success: Does not compile
        // searchInfo.allTasks[0] = new TaskBuilder().description('cannot replace a task').build();
    });

    it('should not be able to modify SearchInfo.allTasks indirectly', () => {
        const tasks = [new TaskBuilder().build()];
        const searchInfo = SearchInfo.fromAllTasks(tasks);

        // Check that updating the original list of tasks does not change the tasks saved in searchInfo.allTasks
        tasks.push(new TaskBuilder().description('I should not be added to searchInfo.allTasks').build());
        expect(searchInfo.allTasks.length).toEqual(1);
    });

    it('should provide access to query search path', () => {
        const searchInfo = new SearchInfo(tasksFile, []);

        expect(searchInfo.tasksFile).toEqual(tasksFile);
        expect(searchInfo.tasksFile?.path).toEqual(path);
    });

    it('should create a QueryContext from a known path', () => {
        const searchInfo = new SearchInfo(tasksFile, []);

        const queryContext = searchInfo.queryContext();

        expect(queryContext).not.toBeUndefined();
        expect(queryContext!.query.file.path).toEqual(tasksFile.path);
    });

    it('should not create a QueryContext from unknown path', () => {
        const searchInfo = new SearchInfo(undefined, []);

        const queryContext = searchInfo.queryContext();

        expect(queryContext).toBeUndefined();
    });

    it('should give the same QueryContext on successive calls, for caching data', () => {
        const searchInfo = new SearchInfo(tasksFile, [new TaskBuilder().build()]);

        searchInfo.queryContext()!.query.searchCache['saved'] = 1;

        expect(searchInfo.queryContext()!.query.searchCache['saved']).toBe(1);
    });
});
