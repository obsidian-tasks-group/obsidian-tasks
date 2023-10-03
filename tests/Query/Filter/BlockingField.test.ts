import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { BlockingField } from '../../../src/Query/Filter/BlockingField';

describe('blocking', () => {
    const filter = new BlockingField().createFilterOrErrorMessage('is blocking');

    it('is blocking', () => {
        const notBlocking = new TaskBuilder().build();
        const child = new TaskBuilder().id('12345').build();
        const childWithoutParent = new TaskBuilder().id('23456').build();
        const parent = new TaskBuilder().dependsOn(['12345']).build();
        const allTasks = [notBlocking, child, parent];

        expect(filter).toBeValid();
        expect(filter).not.toMatchTaskInTaskList(notBlocking, allTasks);
        expect(filter).toMatchTaskInTaskList(child, allTasks);
        expect(filter).not.toMatchTaskInTaskList(parent, allTasks);
        expect(filter).not.toMatchTaskInTaskList(childWithoutParent, allTasks);
    });

    it('is blocking - with circular dependencies, all tasks are matched', () => {
        const id1 = '1';
        const id2 = '2';
        const id3 = '3';
        const task1 = new TaskBuilder().id(id1).dependsOn([id2]).build();
        const task2 = new TaskBuilder().id(id2).dependsOn([id3]).build();
        const task3 = new TaskBuilder().id(id3).dependsOn([id1]).build();
        const allTasks = [task1, task2, task3];

        expect(filter).toMatchTaskInTaskList(task1, allTasks);
        expect(filter).toMatchTaskInTaskList(task2, allTasks);
        expect(filter).toMatchTaskInTaskList(task3, allTasks);
    });
});
