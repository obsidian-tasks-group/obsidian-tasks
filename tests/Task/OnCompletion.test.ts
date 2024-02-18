/**
 * @jest-environment jsdom
 */
import moment from 'moment';
// import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
// import { getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import { Status } from '../../src/Statuses/Status';
import { StatusType } from '../../src/Statuses/StatusConfiguration';
// import type { Task } from '../../src/Task/Task';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { toLines } from '../TestingTools/TestHelpers';
// import { onCompletion } from '../src/Task/OnCompletion';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-11'));
});

afterEach(() => {
    jest.useRealTimers();
    // resetSettings();
});

describe('OnCompletion', () => {
    it('should not impact a non-recurring task lacking an OC trigger/action', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const task = new TaskBuilder().description('A non-recurring, no OC trigger task').dueDate(dueDate).build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = task.handleNewStatus(Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(1);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(
            '"- [x] A non-recurring, no OC trigger task 📅 2024-02-10 ✅ 2024-02-11"',
        );
    });

    it('should delete a non-recurring task with OC trigger/action', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const task = new TaskBuilder()
            .description('A non-recurring task with OC trigger 🏁 WHATEVER')
            .dueDate(dueDate)
            .build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = task.handleNewStatus(Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(0);
    });

    // it('should have no impact a recurring task with no OC trigger and action', () => {
    //     // Arrange
    //     const dueDate = '2024-02-10';
    //     const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
    //     const task = new TaskBuilder().recurrence(recurrence).dueDate(dueDate).build();
    //     expect(task.status.type).toEqual(StatusType.TODO);
    //
    //     // Act
    //     const tasks = task.handleNewStatus(Status.makeDone());
    //
    //     // Assert
    //     expect(tasks.length).toEqual(2);
    //     expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(`
    //         "- [ ] my description 🔁 every day 📅 2024-02-11
    //         - [x] my description 🔁 every day 📅 2024-02-10 ✅ 2024-02-11"
    //     `);
    // });
    // it('should not an OC trigger and valid action', () => {
    //     // Arrange
    //     const dueDate = '2024-02-10';
    //     const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
    //     const task = new TaskBuilder().recurrence(recurrence).dueDate(dueDate).build();
    //     expect(task.status.type).toEqual(StatusType.TODO);
    //
    //     // Act
    //     const tasks = task.handleNewStatus(Status.makeDone());
    //
    //     // Assert
    //     expect(tasks.length).toEqual(2);
    //     expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(`
    //         "- [ ] my description 🔁 every day 📅 2024-02-11
    //         - [x] my description 🔁 every day 📅 2024-02-10 ✅ 2024-02-11"
    //     `);
    // });
    //
    // it('should delete a non-recurring task if trigger and Delete action are present)', () => {
    //     // Arrange
    //     const dueDate = '2024-02-10';
    //     const task = new TaskBuilder().description('delete me upon completion 🏁 Delete').dueDate(dueDate).build();
    //     const tasks = task.handleNewStatus(Status.makeDone());
    //
    //     // Act
    //     const newTasks = onCompletion(tasks);
    //
    //     // Assert
    //     expect(newTasks == 'None');
    // });
    //
    // it('should delete (after new) recurring task if trigger and Delete action are present', () => {
    //     // Arrange
    //     const dueDate = '2024-02-10';
    //     const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
    //     const task = new TaskBuilder()
    //         .description('delete me upon completion 🏁 Delete')
    //         .recurrence(recurrence)
    //         .dueDate(dueDate)
    //         .build();
    //     // updateSettings({ recurrenceOnNextLine: false });
    //     const tasks = task.handleNewStatus(Status.makeDone());
    //
    //     // Act
    //     const newTasks = onCompletion(tasks);
    //
    //     // Assert
    //     expect(toLines(newTasks).join('\n')).toMatchInlineSnapshot(
    //         '"- [ ] delete me upon completion 🏁 Delete 🔁 every day 📅 2024-02-11"',
    //     );
    // });
    //
    // it('should delete (before new) recurring task if trigger and Delete action are present', () => {
    //     // Arrange
    //     const dueDate = '2024-02-10';
    //     const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
    //     const task = new TaskBuilder()
    //         .description('delete me upon completion 🏁 Delete')
    //         .recurrence(recurrence)
    //         .dueDate(dueDate)
    //         .build();
    //     // updateSettings({ recurrenceOnNextLine: true });
    //     const tasks = task.handleNewStatus(Status.makeDone());
    //
    //     // Act
    //     const newTasks = onCompletion(tasks);
    //
    //     // Assert
    //     expect(toLines(newTasks).join('\n')).toMatchInlineSnapshot(
    //         '"- [ ] delete me upon completion 🏁 Delete 🔁 every day 📅 2024-02-11"',
    //     );
    // });
});
