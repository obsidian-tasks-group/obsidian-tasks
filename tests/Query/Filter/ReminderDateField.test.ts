/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { ReminderDateField } from '../../../src/Query/Filter/ReminderDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

function testTaskFilterForTaskWithReminderDate(
    filter: FilterOrErrorMessage,
    reminderDateTime: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.reminder(reminderDateTime), expected);
}

describe('reminder date', () => {
    afterAll(() => {
        jest.useRealTimers();
    });

    it('by reminder date (before)', () => {
        // Arrange
        const filter = new ReminderDateField().createFilterOrErrorMessage('reminder before 2022-04-20 11:45');

        // Act, Assert
        testTaskFilterForTaskWithReminderDate(filter, null, false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-15', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-19 23:59', true);

        // Filter matches whole day, even though it was supplied with a time, so reminders
        // with any time on the filter's day should match.
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 11:44', false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 11:45', false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 11:46', false);

        testTaskFilterForTaskWithReminderDate(filter, '2022-04-21', false);
    });

    it('by reminder date (after)', () => {
        // Arrange
        const filter = new ReminderDateField().createFilterOrErrorMessage('reminder after 2022-04-19 11:45');

        // Act, Assert
        testTaskFilterForTaskWithReminderDate(filter, null, false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-15', false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-18 23:59', false);

        // Filter matches whole day, even though it was supplied with a time, so reminders
        // with any time on the filter's day should match.
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 11:44', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 11:45', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 11:46', true);

        testTaskFilterForTaskWithReminderDate(filter, '2022-04-21', true);
    });

    it('by reminder date (on) - with filter containing date only', () => {
        // Arrange
        const filter = new ReminderDateField().createFilterOrErrorMessage('reminder on 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithReminderDate(filter, null, false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-15', false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 09:15', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-25', false);
    });

    it('by reminder date (on) - with filter containing date and time', () => {
        // Arrange
        const filter = new ReminderDateField().createFilterOrErrorMessage('reminder on 2022-04-20 15:43');

        // Act, Assert
        testTaskFilterForTaskWithReminderDate(filter, null, false);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-15', false);

        // Filter matches whole day, even though it was supplied with a time, so reminders
        // with any time on the filter's day should match.
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 09:15', true);
        testTaskFilterForTaskWithReminderDate(filter, '2022-04-20 15:43', true);

        testTaskFilterForTaskWithReminderDate(filter, '2022-04-25', false);
    });
});

describe('explain reminder date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new ReminderDateField().createFilterOrErrorMessage('reminder before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('reminder date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('should show that times in reminder filters are ignored', () => {
        const filterOrMessage = new ReminderDateField().createFilterOrErrorMessage('reminder on 2023-01-02 15:43');
        expect(filterOrMessage).toHaveExplanation('reminder date is on 2023-01-02 (Monday 2nd January 2023)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new ReminderDateField().createFilterOrErrorMessage('reminder 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('reminder date is on 2023-01-02 (Monday 2nd January 2023)');
    });
});

describe('sorting by reminder', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new ReminderDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // These are minimal tests just to confirm basic behaviour is set up for this field.
    // Thorough testing is done in DueDateField.test.ts.

    // Because Reminder is the first field to support times, we do need to test
    // that sorting takes account of differences in reminder time.
    const date1 = new TaskBuilder().reminder('2021-01-12').build();
    const date2 = new TaskBuilder().reminder('2022-12-23').build();
    const date3 = new TaskBuilder().reminder('2022-12-23 09:27').build();
    const date4 = new TaskBuilder().reminder('2022-12-23 13:59').build();

    it('sort by reminder', () => {
        const sorter = new ReminderDateField().createNormalSorter();
        expectTaskComparesBefore(sorter, date1, date2);
        expectTaskComparesBefore(sorter, date2, date3);
        expectTaskComparesBefore(sorter, date3, date4);
    });

    it('sort by reminder reverse', () => {
        expectTaskComparesAfter(new ReminderDateField().createReverseSorter(), date1, date2);
    });
});

describe('grouping by reminder date', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new ReminderDateField()).toSupportGroupingWithProperty('reminder');
    });

    it('group by reminder date', () => {
        // Arrange
        const grouper = new ReminderDateField().createNormalGrouper();
        const taskWithDate = new TaskBuilder().reminder('1970-01-01').build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect(grouper.grouper(taskWithDate)).toEqual(['1970-01-01 Thursday']);
        expect(grouper.grouper(taskWithoutDate)).toEqual(['No reminder date']);
    });
});
