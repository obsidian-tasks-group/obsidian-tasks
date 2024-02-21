/**
 * @jest-environment jsdom
 */
import Console from 'console';
import moment from 'moment';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import type { Task } from '../../src/Task/Task';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { toLines } from '../TestingTools/TestHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-11'));
});

afterEach(() => {
    jest.useRealTimers();
    // resetSettings();
});

function handleOnCompletion(tasks: Task[], startStatus: Status, endStatus: Status): Task[] {
    const tasksArrayLength = tasks.length;
    const completedTask = tasks[tasksArrayLength - 1];
    if (completedTask == undefined) {
        console.log('Passed-in completedTask is Undefined!');
        return tasks;
    }

    const ocTrigger = ' 🏁 ';
    const taskString = completedTask.toString();

    if (!taskString.includes(ocTrigger) || endStatus.type != StatusType.DONE || endStatus.type == startStatus.type) {
        return tasks;
    }

    if (taskString.includes(ocTrigger)) {
        const taskEnd = taskString.substring(taskString.indexOf(ocTrigger) + 4);
        const ocAction = taskEnd.substring(0, taskEnd.indexOf(' '));
        switch (ocAction) {
            case 'Delete': {
                if (tasksArrayLength == 2) {
                    return [tasks[0]];
                }
                if (tasksArrayLength == 1) {
                    return [];
                }
                break;
            }
            default: {
                const errorMessage = 'Unknown "On Completion" action: ' + ocAction;
                const console = Console;
                console.log(errorMessage);
                // const hint = '\nClick here to clear';
                // const noticeMessage = errorMessage + hint;
                // new Notice(noticeMessage, 0);
                return tasks;
            }
        }
    }
    console.log('Uh-oh -- we should never actually get here...  :( ');
    throw new Error('Something went wrong');
    return tasks;
}

function applyStatusAndOnCompletionAction(task: Task, newStatus: Status) {
    const startStatus = task.status;
    const tasks = task.handleNewStatus(newStatus);
    const endStatus = tasks[tasks.length - 1].status;
    return handleOnCompletion(tasks, startStatus, endStatus);
}

describe('OnCompletion', () => {
    it('should just return task if Action is not recognized', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const task = new TaskBuilder()
            .description('A non-recurring task with invalid OC trigger 🏁 INVALID_ACTION')
            .dueDate(dueDate)
            .build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const returnedTasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(returnedTasks.length).toEqual(1);
        expect(toLines(returnedTasks).join('\n')).toMatchInlineSnapshot(
            '"- [x] A non-recurring task with invalid OC trigger 🏁 INVALID_ACTION 📅 2024-02-10 ✅ 2024-02-11"',
        );
    });

    it('should just return task if StatusType has not changed', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const task = new TaskBuilder()
            .description('An already-DONE, non-recurring task 🏁 Delete')
            .dueDate(dueDate)
            .doneDate(dueDate)
            .status(Status.DONE)
            .build();
        expect(task.status.type).toEqual(StatusType.DONE);

        // Act
        const returnedTasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(returnedTasks.length).toEqual(1);
        expect(toLines(returnedTasks).join('\n')).toMatchInlineSnapshot(
            '"- [x] An already-DONE, non-recurring task 🏁 Delete 📅 2024-02-10 ✅ 2024-02-10"',
        );
    });

    it('should just return trigger-less, non-recurring task', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const task = new TaskBuilder().description('A non-recurring task with no trigger').dueDate(dueDate).build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(1);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(
            '"- [x] A non-recurring task with no trigger 📅 2024-02-10 ✅ 2024-02-11"',
        );
    });

    it('should just return trigger-less recurring task', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
        const task = new TaskBuilder()
            .description('A recurring task with no trigger')
            .recurrence(recurrence)
            .dueDate(dueDate)
            .build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(2);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(`
            "- [ ] A recurring task with no trigger 🔁 every day 📅 2024-02-11
            - [x] A recurring task with no trigger 🔁 every day 📅 2024-02-10 ✅ 2024-02-11"
        `);
    });

    // TODO:  is there a better way to handle the following?  does an 'empty' Task exist?
    it('should return an empty Array for a non-recurring task with Delete Action', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const task = new TaskBuilder().description('A non-recurring task with 🏁 Delete').dueDate(dueDate).build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(tasks).toEqual([]);
    });

    it('should return only the next instance of a recurring task with Delete action', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
        const task = new TaskBuilder()
            .description('A recurring task with 🏁 Delete')
            .recurrence(recurrence)
            .dueDate(dueDate)
            .build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(1);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(
            '"- [ ] A recurring task with 🏁 Delete 🔁 every day 📅 2024-02-11"',
        );
    });
    it('should delete a simple task with flag on completion', () => {
        // Arrange
        const task = new TaskBuilder().description('A non-recurring task with 🏁 Delete').build();

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(0);
    });

    it('should retain the task when going from TODO to IN_PROGRESS', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
        const task = new TaskBuilder()
            .description('A recurring task with 🏁 Delete')
            .recurrence(recurrence)
            .dueDate(dueDate)
            .build();

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.makeInProgress());

        // Assert
        expect(tasks.length).toEqual(1);
        expect(tasks[0].status.type).toEqual(StatusType.IN_PROGRESS);
    });

    it('should retain the task when going from one DONE status to another DONE status', () => {
        // Arrange
        const done1 = new Status(new StatusConfiguration('x', 'done', ' ', true, StatusType.DONE));
        const done2 = new Status(new StatusConfiguration('X', 'DONE', ' ', true, StatusType.DONE));
        const task = new TaskBuilder().description('A simple done task with 🏁 Delete').status(done1).build();

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, done2);

        // Assert
        expect(tasks.length).toEqual(1);
        expect(tasks[0].status.symbol).toEqual('X');
        expect(tasks[0].status.type).toEqual(StatusType.DONE);
    });
});
