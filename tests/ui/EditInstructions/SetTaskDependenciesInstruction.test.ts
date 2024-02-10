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

    describe('1 task depended on by 1 task', () => {
        const markdown = `- [ ] my description 🆔 12345
- [ ] my description ⛔️ 12345`;
        const allTasks = createTasksFromMarkdown(markdown, 'stuff.md', 'Heading');

        it('should remove a dependency', () => {
            const doSecond = allTasks[1];
            const dependsOn: Task[] = [];
            const dependedUpon: Task[] = [];

            const doSecondWithoutTheFirst = setDependencies(doSecond, allTasks, dependsOn, dependedUpon);

            expect(doSecondWithoutTheFirst.dependsOn).toEqual([]);
        });
    });

    describe('should edit 2 tasks depended on by 1 task', () => {
        const s = `- [ ] my description 🆔 12345
- [ ] my description 🆔 67890
- [ ] my description ⛔️ 12345,67890`;
        const allTasks = createTasksFromMarkdown(s, 'stuff.md', 'Heading');

        it('should not create a new task if dependencies are unchanged', () => {
            const doFirst = allTasks[0];
            const dontDependOnMe = allTasks[1];
            const doSecond = allTasks[2];
            const dependedUpon: Task[] = [];

            expect(setDependencies(doSecond, allTasks, [doFirst, dontDependOnMe], dependedUpon)).toBe(doSecond);
        });

        it('should remove one of two dependencies', () => {
            const doFirst = allTasks[0];
            const doSecond = allTasks[2];
            const dependedUpon: Task[] = [];

            // Remove a dependency
            const newTask = setDependencies(doSecond, allTasks, [doFirst], dependedUpon);
            expect(newTask.dependsOn).toEqual([doFirst.id]);
            expect(newTask.toFileLineString()).toMatchInlineSnapshot('"- [ ] my description ⛔️ 12345"');
        });
    });
});
