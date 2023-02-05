/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';
import { ScheduledDateField } from '../../../src/Query/Filter/ScheduledDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import { currentPeriodsTestArray, testFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

describe('explain scheduled date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new ScheduledDateField().createFilterOrErrorMessage('scheduled before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('scheduled date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new ScheduledDateField().createFilterOrErrorMessage('scheduled 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('scheduled date is on 2023-01-02 (Monday 2nd January 2023)');
    });
});

describe('sorting by scheduled', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new ScheduledDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // These are minimal tests just to confirm basic behaviour is set up for this field.
    // Thorough testing is done in DueDateField.test.ts.

    const date1 = new TaskBuilder().scheduledDate('2021-01-12').build();
    const date2 = new TaskBuilder().scheduledDate('2022-12-23').build();

    it('sort by scheduled', () => {
        expectTaskComparesBefore(new ScheduledDateField().createNormalSorter(), date1, date2);
    });

    it('sort by scheduled reverse', () => {
        expectTaskComparesAfter(new ScheduledDateField().createReverseSorter(), date1, date2);
    });
});

describe('scheduled date', () => {
    it('in current week/month/year', () => {
        currentPeriodsTestArray.forEach((p) => {
            const filter = new ScheduledDateField().createFilterOrErrorMessage('scheduled in current ' + p);
            testFilter(filter, new TaskBuilder().scheduledDate(null), false);
            testFilter(filter, new TaskBuilder().scheduledDate(moment().format('YYYY-MM-DD')), true);
            testFilter(filter, new TaskBuilder().scheduledDate(moment().startOf(p).format('YYYY-MM-DD')), true);
            testFilter(filter, new TaskBuilder().scheduledDate(moment().endOf(p).format('YYYY-MM-DD')), true);
            testFilter(
                filter,
                new TaskBuilder().scheduledDate(moment().startOf(p).subtract(1, 'second').format('YYYY-MM-DD')),
                false,
            );
            testFilter(
                filter,
                new TaskBuilder().scheduledDate(moment().endOf(p).add(1, 'second').format('YYYY-MM-DD')),
                false,
            );
        });
    });
});
