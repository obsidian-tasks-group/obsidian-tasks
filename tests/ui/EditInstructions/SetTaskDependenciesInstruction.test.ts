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
        const doFirst = new TaskBuilder().id(id).build();
        const doSecond = new TaskBuilder().dependsOn([id]).build();
        const dependsOn: Task[] = [];
        const dependedUpon: Task[] = [];
        const allTasks = [doFirst, doSecond];

        const doSecondWithoutTheFirst = setDependencies(doSecond, allTasks, dependsOn, dependedUpon);

        expect(doSecondWithoutTheFirst.dependsOn).toEqual([]);
    });
});
