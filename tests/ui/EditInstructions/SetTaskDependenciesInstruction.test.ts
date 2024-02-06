/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import { Task } from '../../../src/Task/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { createTasksFromMarkdown } from '../../TestingTools/TestHelpers';

window.moment = moment;

function setDependencies(task: Task, _allTasks: Task[], dependsOn: Task[], _dependedUpon: Task[]) {
    if (task.dependsOn.length === 0) {
        return task;
    }

    const newDependsOn = dependsOn.map((task) => task.id);
    if (task.dependsOn.toString() === newDependsOn.toString()) {
        return task;
    }

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

    it('should remove dependencies', () => {
        const s = `- [ ] my description 🆔 12345
- [ ] my description 🆔 67890
- [ ] my description ⛔️ 12345,67890`;
        const allTasks = createTasksFromMarkdown(s, 'stuff.md', 'Heading');
        const id1 = '12345';
        const doFirst = allTasks[0];
        const dontDependOnMe = allTasks[1];
        const doSecond = allTasks[2];
        const dependedUpon: Task[] = [];

        expect(setDependencies(doSecond, allTasks, [doFirst, dontDependOnMe], dependedUpon)).toBe(doSecond);
        expect(setDependencies(doSecond, allTasks, [doFirst], dependedUpon).dependsOn).toEqual([id1]);
    });
});
