/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';
import { ScheduledDateField } from '../../../src/Query/Filter/ScheduledDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

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

    it.each([
        [
            // These are minimal tests just to confirm basic behaviour is set up for this field.
            // Thorough testing is done in DueDateField.test.ts.
            'scheduled in this week',
            'scheduled date is between 2022-01-10 (Monday 10th January 2022) and 2022-01-16 (Sunday 16th January 2022) inclusive',
        ],
    ])('explains "%s" as "%s"', (filter: string, expectedExpanation: string) => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15

        const filterOrMessage = new ScheduledDateField().createFilterOrErrorMessage(filter);
        expect(filterOrMessage).toHaveExplanation(expectedExpanation);

        jest.useRealTimers();
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
    it.each([
        // These are minimal tests just to confirm basic behaviour is set up for this field.
        // Thorough testing is done in DueDateField.test.ts.
        ['scheduled in this week', '2022-01-10 (Monday 10th January 2022)', true],
        ['scheduled in this month', '2022-01-01 (Saturday 1st January 2022)', true],
        ['scheduled in this quarter', '2022-01-01 (Saturday 1st January 2022)', true],
        ['scheduled in this half', '2022-01-01 (Saturday 1st January 2022)', true],
        ['scheduled in this year', '2022-01-01 (Saturday 1st January 2022)', true],
    ])(
        '"%s" expect a task with "%s" date in scheduled field to be "%s"',
        (filterString: string, testDate: string, expected: boolean) => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15

            const filter = new ScheduledDateField().createFilterOrErrorMessage(filterString);

            testFilter(filter, new TaskBuilder().scheduledDate(null), false);
            testFilter(filter, new TaskBuilder().scheduledDate(testDate), expected);

            jest.useRealTimers();
        },
    );
});
