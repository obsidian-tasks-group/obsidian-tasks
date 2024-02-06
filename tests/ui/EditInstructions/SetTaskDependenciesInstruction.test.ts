/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import { Task } from '../../../src/Task/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

function setDependencies(task: Task, _allTasks: Task[], dependsOn: Task[], _dependedUpon: Task[]) {
    if (task.dependsOn.length === 0) {
        return task;
    }

    const newDependsOn = dependsOn.map((task) => task.id);
    return new Task({ ...task, dependsOn: newDependsOn });
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

    it('should remove one of two dependencies', () => {
        const id1 = '12345';
        const doFirst = new TaskBuilder().id(id1).build();
        const id2 = '67890';
        const dontDependOnMe = new TaskBuilder().id(id2).build();
        const doSecond = new TaskBuilder().dependsOn([id1, id2]).build();
        const dependsOn: Task[] = [doFirst];
        const dependedUpon: Task[] = [];
        const allTasks = [doFirst, doSecond, dontDependOnMe];

        const doSecondOnlyWithDoFirst = setDependencies(doSecond, allTasks, dependsOn, dependedUpon);

        expect(doSecondOnlyWithDoFirst.dependsOn).toEqual([id1]);
    });
});
