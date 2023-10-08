import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { BlockingField } from '../../../src/Query/Filter/BlockingField';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';

describe('blocking', () => {
    const notBlocking = new TaskBuilder().build();
    const child = new TaskBuilder().id('12345').build();
    const childWithoutParent = new TaskBuilder().id('23456').build();
    const parent = new TaskBuilder().dependsOn(['12345']).build();
    const allTasks = [notBlocking, child, childWithoutParent, parent];

    const isBlocking = new BlockingField().createFilterOrErrorMessage('is blocking');

    it('is blocking', () => {
        expect(isBlocking).toBeValid();
        expect(isBlocking).not.toMatchTaskInTaskList(notBlocking, allTasks);
        expect(isBlocking).toMatchTaskInTaskList(child, allTasks);
        expect(isBlocking).not.toMatchTaskInTaskList(parent, allTasks);
        expect(isBlocking).not.toMatchTaskInTaskList(childWithoutParent, allTasks);
    });

    it('is blocking - with circular dependencies, all tasks are matched', () => {
        const id1 = '1';
        const id2 = '2';
        const id3 = '3';
        const task1 = new TaskBuilder().id(id1).dependsOn([id2]).build();
        const task2 = new TaskBuilder().id(id2).dependsOn([id3]).build();
        const task3 = new TaskBuilder().id(id3).dependsOn([id1]).build();
        const allTasks = [task1, task2, task3];

        expect(isBlocking).toMatchTaskInTaskList(task1, allTasks);
        expect(isBlocking).toMatchTaskInTaskList(task2, allTasks);
        expect(isBlocking).toMatchTaskInTaskList(task3, allTasks);
    });

    it('should work with Boolean filters', function () {
        const id = 'abc';
        const task1 = new TaskBuilder().id(id).build();
        const task2 = new TaskBuilder().dependsOn([id]).build();
        const allTasks = [task1, task2];

        const booleanFilter = new BooleanField().createFilterOrErrorMessage('NOT ( NOT ( is blocking ) )');

        // This test ensures that BooleanField passes the task list down to individual filters
        expect(booleanFilter).toMatchTaskInTaskList(task1, allTasks);
        expect(booleanFilter).not.toMatchTaskInTaskList(task2, allTasks);
    });
});

describe('is not blocked', () => {
    // const id = 'abc';
    // const blocking = new TaskBuilder().id(id).build();
    // const blocked = new TaskBuilder().dependsOn([id]).build();
    // const _allTasks = [blocking, blocked];

    const isNotBlocked = new BlockingField().createFilterOrErrorMessage('is not blocked');

    it('should hide blocked tasks', () => {
        expect(isNotBlocked).toBeValid();
        // expect(isBlocking).not.toMatchTaskInTaskList(notBlocking, allTasks);
        // expect(isBlocking).toMatchTaskInTaskList(child, allTasks);
    });
});
