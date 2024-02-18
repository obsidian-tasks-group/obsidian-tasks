/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
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
    it('should not impact a non-recurring task with no OC trigger/action', () => {
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

    it('should not impact a recurring task with no OC trigger/action', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
        const task = new TaskBuilder()
            .description('A recurring task with no OC trigger')
            .recurrence(recurrence)
            .dueDate(dueDate)
            .build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = task.handleNewStatus(Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(2);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(`
            "- [ ] A recurring task with no OC trigger 🔁 every day 📅 2024-02-11
            - [x] A recurring task with no OC trigger 🔁 every day 📅 2024-02-10 ✅ 2024-02-11"
        `);
    });

    it('should delete a recurring task with OC trigger/action', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
        const task = new TaskBuilder()
            .description('A recurring task with OC trigger 🏁 WHATEVER')
            .recurrence(recurrence)
            .dueDate(dueDate)
            .build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = task.handleNewStatus(Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(1);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(
            '"- [ ] A recurring task with OC trigger 🏁 WHATEVER 🔁 every day 📅 2024-02-11"',
        );
    });
});
