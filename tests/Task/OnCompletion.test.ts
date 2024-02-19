/**
 * @jest-environment jsdom
 */
// import Console from 'console';
import moment from 'moment';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { Status } from '../../src/Statuses/Status';
import { StatusType } from '../../src/Statuses/StatusConfiguration';
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
    if (endStatus == startStatus) {
        return tasks;
    }
    const taskString = completedTask.toString();
    const ocTrigger = ' 🏁 ';
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
                // const console = Console;
                // const hint = '\nClick here to clear';
                // const errorMessage = 'Unknown "On Completion" action: ' + ocAction + hint;
                // console.log(errorMessage);
                // new Notice(errorMessage, 0);
                return tasks;
            }
        }
    }
    return tasks;
}

function applyStatusAndActOnCompletion(task: Task) {
    const startStatus = task.status;
    const tasks = task.handleNewStatus(Status.makeDone());
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
        const returnedTasks = applyStatusAndActOnCompletion(task);

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
        const returnedTasks = applyStatusAndActOnCompletion(task);

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
        const tasks = applyStatusAndActOnCompletion(task);

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
        const tasks = applyStatusAndActOnCompletion(task);

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
        const tasks = applyStatusAndActOnCompletion(task);

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
        const tasks = applyStatusAndActOnCompletion(task);

        // Assert
        expect(tasks.length).toEqual(1);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(
            '"- [ ] A recurring task with 🏁 Delete 🔁 every day 📅 2024-02-11"',
        );
    });
});
