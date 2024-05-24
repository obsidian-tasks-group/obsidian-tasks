/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from '../../src/Task/Task';
import {
    type HappensDate,
    createFixedDateTask,
    createPostponedTask,
    createTaskWithDateRemoved,
    fixedDateMenuItemTitle,
    getDateFieldToPostpone,
    postponeButtonTitle,
    postponeMenuItemTitle,
    postponementSuccessMessage,
    removeDateMenuItemTitle,
    shouldShowPostponeButton,
} from '../../src/Scripting/Postponer';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import type { PostponingFunction } from '../../src/ui/Menus/PostponeMenu';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

const yesterday = '2023-12-02';
const today = '2023-12-03';
const tomorrow = '2023-12-04';

const invalidDate = '2023-12-36';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

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

    // TODO Check it refuses to postpone an invalid date (failing test)
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

    it('should not show button for a task with an invalid start date', () => {
        const task = new TaskBuilder().startDate(invalidDate).build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });

    it('should show button for a task with a scheduled date only', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-02').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should not show button for a task with an invalid scheduled date', () => {
        const task = new TaskBuilder().scheduledDate(invalidDate).build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });

    it('should show button for a task with a due date only', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').build();

        expect(shouldShowPostponeButton(task)).toEqual(true);
    });

    it('should not show button for a task with an invalid due date', () => {
        const task = new TaskBuilder().dueDate(invalidDate).build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });

    it('should not show button for a task with an invalid created date', () => {
        const task = new TaskBuilder().createdDate(invalidDate).scheduledDate(today).build();

        expect(shouldShowPostponeButton(task)).toEqual(false);
    });
});

describe('postpone - UI text', () => {
    it('should include date type and new date in button tooltip', () => {
        const task = new TaskBuilder().dueDate(today).build();
        expect(postponeButtonTitle(task, 1, 'day')).toEqual(
            'ℹ️ Due tomorrow, on Mon 4th Dec (right-click for more options)',
        );
        expect(postponeButtonTitle(task, 2, 'days')).toEqual(
            'ℹ️ Due in 2 days, on Tue 5th Dec (right-click for more options)',
        );
    });

    it('should include date type and new date in context menu labels when due today', () => {
        const task = new TaskBuilder().dueDate(today).build();

        expect(postponeMenuItemTitle(task, 1, 'day')).toEqual('Due tomorrow, on Mon 4th Dec');
        expect(postponeMenuItemTitle(task, 2, 'days')).toEqual('Due in 2 days, on Tue 5th Dec');
    });

    it('should include date type and new date in context menu labels when overdue', () => {
        const task = new TaskBuilder().scheduledDate(yesterday).build();

        expect(postponeMenuItemTitle(task, 1, 'day')).toEqual('Scheduled tomorrow, on Mon 4th Dec');
        expect(postponeMenuItemTitle(task, 2, 'days')).toEqual('Scheduled in 2 days, on Tue 5th Dec');
    });

    it('should include date type and new date in context menu labels when due in future', () => {
        const task = new TaskBuilder().startDate(tomorrow).build();

        expect(postponeMenuItemTitle(task, 1, 'day')).toEqual('Postpone start date by a day, to Tue 5th Dec');
        expect(postponeMenuItemTitle(task, 2, 'days')).toEqual('Postpone start date by 2 days, to Wed 6th Dec');
    });

    it('should show dates relative to today, when using fixed date menu items - foe today and tomorrow', () => {
        const task = new TaskBuilder().dueDate(tomorrow).build();

        expect(fixedDateMenuItemTitle(task, 0, 'days')).toEqual('Due today, on Sun 3rd Dec');
        expect(fixedDateMenuItemTitle(task, 1, 'day')).toEqual('Due tomorrow, on Mon 4th Dec');
        expect(fixedDateMenuItemTitle(task, 2, 'days')).toEqual('Due in 2 days, on Tue 5th Dec');
    });

    it('should include date type when removing value', () => {
        const task = new TaskBuilder().dueDate(yesterday).build();
        // TODO Include the current date?
        expect(removeDateMenuItemTitle(task, 1, 'day')).toEqual('Remove due date');
    });

    it('should not offer to remove an inferred scheduled date', () => {
        const task = new TaskBuilder().scheduledDate(today).scheduledDateIsInferred(true).build();
        expect(removeDateMenuItemTitle(task, 1, 'day')).toEqual('Cannot remove inferred scheduled date');
    });
});

describe('postpone - new task creation', () => {
    function testPostponedTaskAndDate(
        task: Task,
        expectedDateField: HappensDate,
        expectedPostponedDate: string,
        postponingFunction: PostponingFunction,
    ) {
        const { postponedDate, postponedTask } = postponingFunction(task, expectedDateField, 'day', 1);
        if (expectedPostponedDate.length > 0) {
            expect(postponedDate).not.toBeNull();
            expect(postponedDate!.format('YYYY-MM-DD')).toEqual(expectedPostponedDate);
            expect(postponedTask[expectedDateField]?.format('YYYY-MM-DD')).toEqual(expectedPostponedDate);
        } else {
            expect(postponedDate).toBeNull();
            expect(postponedTask[expectedDateField]).toBeNull();
        }

        // If the scheduled date was inferred from the filename, and it is the scheduledDate that was postponed,
        // we must ensure that the 'inferred' flag has been reset to false.
        // Otherwise, the new scheduled date will be ignored in some locations, like rendering of dates.
        if (task.scheduledDateIsInferred && expectedDateField === 'scheduledDate') {
            expect(postponedTask.scheduledDateIsInferred).toEqual(false);
        }
    }

    it('should postpone an overdue task to today', () => {
        const task = new TaskBuilder().dueDate('2023-11-01').build();
        const expectedPostponedDate = '2023-12-04';
        testPostponedTaskAndDate(task, 'dueDate', expectedPostponedDate, createPostponedTask);
    });

    it('should postpone a task scheduled today to tomorrow', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();
        testPostponedTaskAndDate(task, 'scheduledDate', '2023-12-04', createPostponedTask);
    });

    it('should postpone a task scheduled today to tomorrow, when the scheduled date is inferred', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-03').scheduledDateIsInferred(true).build();
        testPostponedTaskAndDate(task, 'scheduledDate', '2023-12-04', createPostponedTask);
    });

    it('should postpone a task that starts in the future to the next day', () => {
        const task = new TaskBuilder().startDate('2024-03-05').build();
        testPostponedTaskAndDate(task, 'startDate', '2024-03-06', createPostponedTask);
    });

    it('should postpone a task that starts in the future to tomorrow, if using fixed date', () => {
        const task = new TaskBuilder().startDate('2024-03-05').build();
        testPostponedTaskAndDate(task, 'startDate', '2023-12-04', createFixedDateTask);
    });

    it('should remove a date', () => {
        const task = new TaskBuilder().startDate('2024-03-05').build();
        testPostponedTaskAndDate(task, 'startDate', '', createTaskWithDateRemoved);
    });
});

describe('postpone - postponement success message', () => {
    it('should generate a message for a valid date', () => {
        const message = postponementSuccessMessage(moment('2023-11-30'), 'scheduledDate');
        expect(message).toEqual("Task's scheduledDate changed to 30 Nov 2023");
    });

    it('should generate a message for an invalid date', () => {
        const message = postponementSuccessMessage(moment(invalidDate), 'dueDate');
        expect(message).toEqual("Task's dueDate changed to Invalid date");
    });

    it('should generate a message for a removed date', () => {
        const message = postponementSuccessMessage(null, 'dueDate');
        expect(message).toEqual("Task's dueDate removed");
    });
});
