/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { ReminderTimeField } from '../../../src/Query/Filter/ReminderTimeField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';

window.moment = moment;

describe('reminder', () => {
    it('should supply field name', () => {
        expect(new ReminderTimeField().fieldName()).toEqual('reminder');
    });
});

describe('filtering by reminder', () => {
    it('by reminder presence', () => {
        const line = 'has reminder';
        const field = new ReminderTimeField();
        expect(field.canCreateFilterForLine(line)).toEqual(true);

        const filter = field.createFilterOrErrorMessage(line);
        testFilter(filter, new TaskBuilder().reminderTime(null), false);
        testFilter(filter, new TaskBuilder().reminderTime('09:00'), true);
    });

    it('by reminder absence', () => {
        const line = 'no reminder';
        const filter = new ReminderTimeField().createFilterOrErrorMessage(line);

        testFilter(filter, new TaskBuilder().reminderTime(null), true);
        testFilter(filter, new TaskBuilder().reminderTime('09:00'), false);
    });

    it('by reminder before a time', () => {
        const filter = new ReminderTimeField().createFilterOrErrorMessage('reminder before 12:00');

        testFilter(filter, new TaskBuilder().reminderTime(null), false);
        testFilter(filter, new TaskBuilder().reminderTime('09:00'), true);
        testFilter(filter, new TaskBuilder().reminderTime('12:00'), false);
        testFilter(filter, new TaskBuilder().reminderTime('15:00'), false);
    });

    it('by reminder after a time', () => {
        const filter = new ReminderTimeField().createFilterOrErrorMessage('reminder after 12:00');

        testFilter(filter, new TaskBuilder().reminderTime(null), false);
        testFilter(filter, new TaskBuilder().reminderTime('09:00'), false);
        testFilter(filter, new TaskBuilder().reminderTime('12:00'), false);
        testFilter(filter, new TaskBuilder().reminderTime('15:00'), true);
    });

    it('by reminder on a time', () => {
        const filter = new ReminderTimeField().createFilterOrErrorMessage('reminder on 12:00');

        testFilter(filter, new TaskBuilder().reminderTime(null), false);
        testFilter(filter, new TaskBuilder().reminderTime('09:00'), false);
        testFilter(filter, new TaskBuilder().reminderTime('12:00'), true);
    });

    it('should report an error for a malformed time', () => {
        const filterOrMessage = new ReminderTimeField().createFilterOrErrorMessage('reminder before 9am');

        expect(filterOrMessage.error).toEqual(
            "do not understand reminder time - expected a time in HH:mm format, such as '09:00'",
        );
    });

    it('should report an error for an unrecognised instruction', () => {
        const filterOrMessage = new ReminderTimeField().createFilterOrErrorMessage('reminder wibble 09:00');

        expect(filterOrMessage.error).toEqual('do not understand query filter (reminder)');
    });
});

describe('explain reminder queries', () => {
    it('should explain a before/after/on instruction', () => {
        const filterOrMessage = new ReminderTimeField().createFilterOrErrorMessage('reminder before 12:00');
        expect(filterOrMessage).toHaveExplanation('reminder time is before 12:00');
    });
});

describe('sorting by reminder', () => {
    it('supports Field sorting methods correctly', () => {
        expect(new ReminderTimeField().supportsSorting()).toEqual(true);
    });

    const earlier = new TaskBuilder().reminderTime('09:00').build();
    const later = new TaskBuilder().reminderTime('18:00').build();
    const none = new TaskBuilder().reminderTime(null).build();

    it('sort by reminder', () => {
        expectTaskComparesBefore(new ReminderTimeField().createNormalSorter(), earlier, later);
    });

    it('sort by reminder reverse', () => {
        expectTaskComparesAfter(new ReminderTimeField().createReverseSorter(), earlier, later);
    });

    it('should sort a task with a reminder before one without, in normal sort order', () => {
        expectTaskComparesBefore(new ReminderTimeField().createNormalSorter(), earlier, none);
    });
});

describe('grouping by reminder', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new ReminderTimeField()).toSupportGroupingWithProperty('reminder');
    });

    it('group by reminder', () => {
        const grouper = new ReminderTimeField().createNormalGrouper();
        const taskWithReminder = new TaskBuilder().reminderTime('09:00').build();
        const taskWithoutReminder = new TaskBuilder().build();

        expect({ grouper, tasks: [taskWithReminder] }).groupHeadingsToBe(['09:00']);
        expect({ grouper, tasks: [taskWithoutReminder] }).groupHeadingsToBe(['No reminder']);
    });
});
