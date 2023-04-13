/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { StartDateField } from '../../../src/Query/Filter/StartDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';

window.moment = moment;

describe('explain start date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new StartDateField().createFilterOrErrorMessage('starts before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'start date is before 2023-01-02 (Monday 2nd January 2023) OR no start date',
        );
    });

    it('should explain absolute date range', () => {
        const filterOrMessage = new StartDateField().createFilterOrErrorMessage('starts 2023-03-01 2023-03-03');
        // Full date range testing done in DueDateField
        // But StartDateField is so far the only Field with 'OR no start date' in explanation
        expect(filterOrMessage).toHaveExplanation(
            `start date is between:
  2023-03-01 (Wednesday 1st March 2023) and
  2023-03-03 (Friday 3rd March 2023) inclusive
  OR no start date`,
        );
    });

    it('implicit "on" gets added to explanation, and it is clear that start date is optional', () => {
        const filterOrMessage = new StartDateField().createFilterOrErrorMessage('starts 2023-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'start date is on 2023-01-02 (Monday 2nd January 2023) OR no start date',
        );
    });
});

describe('sorting by start', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new StartDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // These are minimal tests just to confirm basic behaviour is set up for this field.
    // Thorough testing is done in DueDateField.test.ts.

    const date1 = new TaskBuilder().startDate('2021-01-12').build();
    const date2 = new TaskBuilder().startDate('2022-12-23').build();

    it('sort by start', () => {
        expectTaskComparesBefore(new StartDateField().createNormalSorter(), date1, date2);
    });

    it('sort by start reverse', () => {
        expectTaskComparesAfter(new StartDateField().createReverseSorter(), date1, date2);
    });
});

describe('grouping by start date', () => {
    it('supports Field grouping methods correctly', () => {
        const field = new StartDateField();
        expect(field.supportsGrouping()).toEqual(true);
    });

    it('group by start date', () => {
        // Arrange
        const grouper = new StartDateField().createGrouper();
        const taskWithDate = new TaskBuilder().startDate('1970-01-01').build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect(grouper.grouper(taskWithDate)).toEqual(['1970-01-01 Thursday']);
        expect(grouper.grouper(taskWithoutDate)).toEqual(['No start date']);
    });
});
