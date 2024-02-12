/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { StatusType } from '../../src/Statuses/StatusConfiguration';
import { Status } from '../../src/Statuses/Status';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { toLines } from '../TestingTools/TestHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-11'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('OnCompletion', () => {
    it('should be able to complete recurring task', () => {
        // Arrange
        const dueDate = '2024-02-10';
        const recurrence = new RecurrenceBuilder().rule('every day').dueDate(dueDate).build();
        const task = new TaskBuilder().recurrence(recurrence).dueDate(dueDate).build();
        expect(task.status.type).toEqual(StatusType.TODO);

        // Act
        const tasks = task.handleNewStatus(Status.makeDone());

        // Assert
        expect(tasks.length).toEqual(2);
        expect(toLines(tasks).join('\n')).toMatchInlineSnapshot(`
            "- [ ] my description 🔁 every day 📅 2024-02-11
            - [x] my description 🔁 every day 📅 2024-02-10 ✅ 2024-02-11"
        `);
    });
});
