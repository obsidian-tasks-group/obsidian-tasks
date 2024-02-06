/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import { Task } from '../../../src/Task/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

function setDependencies(task: Task, _allTasks: Task[], _dependsOn: Task[], _dependedUpon: Task[]) {
    if (task.dependsOn.length === 0) {
        return task;
    }

    return new Task({ ...task, dependsOn: [] });
}

describe('Edit dependencies', () => {
    it('should return original task if no edits were made', () => {
        const task = new TaskBuilder().build();
        const dependsOn: Task[] = [];
        const dependedUpon: Task[] = [];

        const editedTask = setDependencies(task, [task], dependsOn, dependedUpon);

        expect(editedTask).toBe(task);
    });

    it('should remove a dependency', () => {
        const id = '12345';
        const task1 = new TaskBuilder().id(id).build();
        const task2 = new TaskBuilder().dependsOn([id]).build();
        const dependsOn: Task[] = [];
        const dependedUpon: Task[] = [];
        const allTasks = [task1, task2];

        const editedTask = setDependencies(task2, allTasks, dependsOn, dependedUpon);

        expect(editedTask.dependsOn).toEqual([]);
    });
});
