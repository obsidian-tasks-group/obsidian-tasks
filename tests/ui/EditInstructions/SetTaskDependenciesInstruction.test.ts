/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import { Task } from '../../../src/Task/Task';
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

function createTasks(markdown: string) {
    return createTasksFromMarkdown(markdown, 'stuff.md', 'Heading');
}

describe('Edit dependencies', () => {
    describe('1 tasks, no dependencies', () => {
        const markdown = `
- [ ] my description
`;
        const allTasks = createTasks(markdown);

        it('should return original task if no edits were made', () => {
            const editedTask = setDependencies(allTasks[0], allTasks, [], []);
            expect(editedTask).toBe(allTasks[0]);
        });
    });

    describe('1 task depended on by 1 task', () => {
        const markdown = `
- [ ] my description 🆔 12345
- [ ] my description ⛔ 12345
`;
        const allTasks = createTasks(markdown);

        it('should remove a dependency', () => {
            const doSecond = allTasks[1];
            const dependsOn: Task[] = [];
            const dependedUpon: Task[] = [];

            const doSecondWithoutTheFirst = setDependencies(doSecond, allTasks, dependsOn, dependedUpon);

            expect(doSecondWithoutTheFirst.dependsOn).toEqual([]);
        });
    });

    describe('2 tasks depended on by 1 task', () => {
        const markdown = `
- [ ] my description 🆔 12345
- [ ] my description 🆔 67890
- [ ] my description ⛔ 12345,67890
`;
        const allTasks = createTasks(markdown);

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
            expect(newTask.toFileLineString()).toMatchInlineSnapshot('"- [ ] my description ⛔ 12345"');
        });
    });

    describe('task with broken dependencies', () => {
        const markdown = `
- [ ] I started with no ID
- [ ] I started depending on non-existent ID ⛔ 12345
`;
        // @ts-expect-error Unused variable
        const allTasks = createTasks(markdown);

        it.failing('should remove invalid ID when editing a dependency', () => {
            expect(2).toEqual(1);
        });
    });
});
