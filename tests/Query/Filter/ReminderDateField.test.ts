/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { ReminderDateField } from '../../../src/Query/Filter/ReminderDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';

window.moment = moment;

describe('explain reminder date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new ReminderDateField().createFilterOrErrorMessage('reminder before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('reminder date is before 2023-01-02 (Monday 2nd January 2023)');
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

    const date1 = new TaskBuilder().reminders(['2021-01-12']).build();
    const date2 = new TaskBuilder().reminders(['2022-12-23']).build();

    it('sort by reminder', () => {
        expectTaskComparesBefore(new ReminderDateField().createNormalSorter(), date1, date2);
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
        const grouper = new ReminderDateField().createGrouper();
        const taskWithDate = new TaskBuilder().reminders(['1970-01-01']).build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect(grouper.grouper(taskWithDate)).toEqual(['1970-01-01 Thursday']);
        expect(grouper.grouper(taskWithoutDate)).toEqual(['No reminder date']);
    });
});
