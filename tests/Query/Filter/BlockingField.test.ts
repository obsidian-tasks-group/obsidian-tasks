import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { BlockingField } from '../../../src/Query/Filter/BlockingField';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import { Status } from '../../../src/Statuses/Status';

describe('blocking', () => {
    const notBlocking = new TaskBuilder().build();
    const child = new TaskBuilder().id('12345').build();
    const childWithoutParent = new TaskBuilder().id('23456').build();
    const parent = new TaskBuilder().blockedBy(['12345']).build();
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
        const task1 = new TaskBuilder().id(id1).blockedBy([id2]).build();
        const task2 = new TaskBuilder().id(id2).blockedBy([id3]).build();
        const task3 = new TaskBuilder().id(id3).blockedBy([id1]).build();
        const allTasks = [task1, task2, task3];

        expect(isBlocking).toMatchTaskInTaskList(task1, allTasks);
        expect(isBlocking).toMatchTaskInTaskList(task2, allTasks);
        expect(isBlocking).toMatchTaskInTaskList(task3, allTasks);
    });

    it('should work with Boolean filters', function () {
        const id = 'abc';
        const task1 = new TaskBuilder().id(id).build();
        const task2 = new TaskBuilder().blockedBy([id]).build();
        const allTasks = [task1, task2];

        const booleanFilter = new BooleanField().createFilterOrErrorMessage('NOT ( NOT ( is blocking ) )');

        // This test ensures that BooleanField passes the task list down to individual filters
        expect(booleanFilter).toMatchTaskInTaskList(task1, allTasks);
        expect(booleanFilter).not.toMatchTaskInTaskList(task2, allTasks);
    });
});

describe('is not blocked', () => {
    const isNotBlocked = new BlockingField().createFilterOrErrorMessage('is not blocked');
    const blockingId = 'abc';
    const blocking = new TaskBuilder().id(blockingId).build();

    it('should hide blocked tasks', () => {
        const blocked = new TaskBuilder().blockedBy([blockingId]).build();
        const allTasks = [blocking, blocked];

        expect(isNotBlocked).toBeValid();
        expect(isNotBlocked).not.toMatchTaskInTaskList(blocked, allTasks);
        expect(isNotBlocked).toMatchTaskInTaskList(blocking, allTasks);
    });

    it('should treat completed deps as non-blocking', () => {
        const blockingCompletedId = 'def';
        const blockingCompleted = new TaskBuilder().id(blockingCompletedId).status(Status.DONE).build();

        const blockedByIncomplete = new TaskBuilder().blockedBy([blockingId]).build();
        const blockedByComplete = new TaskBuilder().blockedBy([blockingCompletedId]).build();
        const blockedByAll = new TaskBuilder().blockedBy([blockingId, blockingCompletedId]).build();

        const allTasks = [blocking, blockedByIncomplete, blockedByComplete, blockedByAll];

        expect(isNotBlocked).toMatchTaskInTaskList(blockingCompleted, allTasks);
        expect(isNotBlocked).toMatchTaskInTaskList(blockedByComplete, allTasks);
        expect(isNotBlocked).not.toMatchTaskInTaskList(blockedByIncomplete, allTasks);
        expect(isNotBlocked).not.toMatchTaskInTaskList(blockedByAll, allTasks);

        blocking.status.isCompleted();
    });
});
