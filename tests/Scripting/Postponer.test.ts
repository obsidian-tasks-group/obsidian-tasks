/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import {
    type HappensDate,
    getDateFieldToPostpone,
    postponementSuccessMessage,
    shouldShowPostponeButton,
} from '../../src/Scripting/Postponer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { StatusConfiguration, StatusType } from '../../src/StatusConfiguration';
import { Status } from '../../src/Status';

window.moment = moment;

describe('postpone - date field choice', () => {
    function checkPostponeField(taskBuilder: TaskBuilder, expected: HappensDate | null) {
        const task = taskBuilder.build();
        expect(getDateFieldToPostpone(task)).toEqual(expected);
    }

    function checkDoesNotPostpone(taskBuilder: TaskBuilder) {
        checkPostponeField(taskBuilder, null);
    }

    // Since the actual date values do not affect the calculation, we use the same value for all tests,
    // so that the field names stand out when comparing tests.
    const date = '2023-11-26';

    it('should not postpone if no happens dates on task', () => {
        const taskBuilder = new TaskBuilder();
        checkDoesNotPostpone(taskBuilder);
    });

    it('should not postpone created or done dates', () => {
        const taskBuilder = new TaskBuilder().createdDate(date).doneDate(date);
        checkDoesNotPostpone(taskBuilder);
    });

    it('should postpone due date', () => {
        const taskBuilder = new TaskBuilder().dueDate(date);
        checkPostponeField(taskBuilder, 'dueDate');
    });

    it('should postpone scheduled date', () => {
        const taskBuilder = new TaskBuilder().scheduledDate(date);
        checkPostponeField(taskBuilder, 'scheduledDate');
    });

    it('should postpone when scheduled date is inferred', () => {
        const taskBuilder = new TaskBuilder().scheduledDate(date).scheduledDateIsInferred(true);
        checkPostponeField(taskBuilder, 'scheduledDate');
    });

    it('should postpone start date', () => {
        const taskBuilder = new TaskBuilder().startDate(date);
        checkPostponeField(taskBuilder, 'startDate');
    });

    it('should postpone due date in preference to start and scheduled dates', () => {
        const taskBuilder = new TaskBuilder().dueDate(date).scheduledDate(date).startDate(date);
        checkPostponeField(taskBuilder, 'dueDate');
    });

    it('should postpone scheduled date in preference to start date', () => {
        const taskBuilder = new TaskBuilder().scheduledDate(date).startDate(date);
        checkPostponeField(taskBuilder, 'scheduledDate');
    });
});

describe('postpone - whether to show button', () => {
    it('should account for status type', () => {
        function checkPostponeButtonVisibility(statusType: StatusType, expected: boolean) {
            const status = new Status(new StatusConfiguration('p', 'Test', 'q', true, statusType));
            const task = new TaskBuilder().dueDate('2023-10-30').status(status).build();
            expect(shouldShowPostponeButton(task)).toEqual(expected);
        }

        // Statuses considered as done:
        checkPostponeButtonVisibility(StatusType.TODO, true);
        checkPostponeButtonVisibility(StatusType.IN_PROGRESS, true);

        // Statuses considered as not done:
        checkPostponeButtonVisibility(StatusType.NON_TASK, false);
        checkPostponeButtonVisibility(StatusType.CANCELLED, false);
        checkPostponeButtonVisibility(StatusType.DONE, false);
    });

    it('should not show button for a task with no dates', () => {
        const task = new TaskBuilder().build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });

    it('should not show button for a task with a created date only', () => {
        const task = new TaskBuilder().createdDate('2023-11-29').build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });

    it('should not show button for a task with a done date only', () => {
        const task = new TaskBuilder().doneDate('2023-11-30').build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });

    it('should show button for a task with a start date only', () => {
        const task = new TaskBuilder().startDate('2023-12-01').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should show button for a task with an invalid start date', () => {
        const task = new TaskBuilder().startDate('2023-13-01').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should show button for a task with a scheduled date only', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-02').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should show button for a task with an invalid scheduled date', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-36').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should show button for a task with a due date only', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should show button for a task with an invalid due date', () => {
        const task = new TaskBuilder().dueDate('20233-12-03').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });
});

describe('postpone - postponement success message', () => {
    it('should generate a message for a valid date', () => {
        const message = postponementSuccessMessage(moment('2023-11-30'), 'scheduledDate');
        expect(message).toEqual("Task's scheduledDate postponed until 30 Nov 2023");
    });

    it('should generate a message for an invalid date', () => {
        const message = postponementSuccessMessage(moment('2023-13-30'), 'dueDate');
        expect(message).toEqual("Task's dueDate postponed until Invalid date");
    });
});
