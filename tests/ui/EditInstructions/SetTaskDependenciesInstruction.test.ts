import type { Task } from '../../../src/Task/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

function setDependencies(task: Task, _dependsOn: Task[], _dependedUpon: Task[]) {
    return task;
}

describe('Edit dependencies', () => {
    it('should return original task if no edits were made', () => {
        const task = new TaskBuilder().build();
        const dependsOn: Task[] = [];
        const dependedUpon: Task[] = [];

        const editedTask = setDependencies(task, dependsOn, dependedUpon);

        expect(editedTask).toBe(task);
    });
});
