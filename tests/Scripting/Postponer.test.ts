/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { type HappensDate, getDateFieldToPostpone } from '../../src/Scripting/Postponer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

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
