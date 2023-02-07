/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';
import * as CustomMatchersForSorting from '../../CustomMatchers/CustomMatchersForSorting';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

describe('happens date', () => {
    it('by happens date presence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage('has happens date');

        // Act, Assert
        testFilter(filter, new TaskBuilder().dueDate(null), false);

        // scheduled, start and due all contribute to happens:
        testFilter(filter, new TaskBuilder().scheduledDate('2022-04-15'), true);
        testFilter(filter, new TaskBuilder().startDate('2022-04-15'), true);
        testFilter(filter, new TaskBuilder().dueDate('2022-04-15'), true);

        // Done date is ignored by happens
        testFilter(filter, new TaskBuilder().doneDate('2022-04-15'), false);
    });

    it('by happens date absence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage('no happens date');

        // Act, Assert
        testFilter(filter, new TaskBuilder().dueDate(null), true);

        // scheduled, start and due all contribute to happens:
        testFilter(filter, new TaskBuilder().scheduledDate('2022-04-15'), false);
        testFilter(filter, new TaskBuilder().startDate('2022-04-15'), false);
        testFilter(filter, new TaskBuilder().dueDate('2022-04-15'), false);

        // Done date is ignored by happens
        testFilter(filter, new TaskBuilder().doneDate('2022-04-15'), true);
    });

    it.each([
        // Week
        ['happens in this week', '2022-01-09 (Sunday 9th January 2022)', false],
        ['happens in this week', '2022-01-10 (Monday 10th January 2022)', true],
        ['happens in this week', '2022-01-16 (Sunday 16th January 2022)', true],
        ['happens in this week', '2022-01-17 (Monday 16th January 2022)', false],

        // Month
        ['happens in this month', '2021-12-31 (Friday 31st December 2021)', false],
        ['happens in this month', '2022-01-01 (Saturday 1st January 2022)', true],
        ['happens in this month', '2022-01-31 (Monday 31st January 2022)', true],
        ['happens in this month', '2022-02-01 (Tuesday 1st February 2022)', false],

        // Quarter
        ['happens in this quarter', '2021-12-31 (Friday 31st December 2021)', false],
        ['happens in this quarter', '2022-01-01 (Saturday 1st January 2022)', true],
        ['happens in this quarter', '2022-03-31 (Thursday 31st March 2022)', true],
        ['happens in this quarter', '2022-04-01 (Friday 1st April 2022)', false],

        // Half
        ['happens in this half', '2021-12-31 (Friday 31st December 2021)', false],
        ['happens in this half', '2022-01-01 (Saturday 1st January 2022)', true],
        ['happens in this half', '2022-06-30 (Thursday 30th June 2022)', true],
        ['happens in this half', '2022-07-01 (Friday 1st July 2022)', false],

        // Year
        ['happens in this year', '2021-12-31', false],
        ['happens in this year', '2022-01-01 (Saturday 1st January 2022)', true],
        ['happens in this year', '2022-12-31 (Saturday 31st December 2022)', true],
        ['happens in this year', '2023-01-01 (Sunday 1st January 2023)', false],
    ])(
        'For filter "%s" expect a task with "%s" date in scheduled/start/due field to be "%s"',
        (filterString: string, testDate: string, expected: boolean) => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15

            const filter = new HappensDateField().createFilterOrErrorMessage(filterString);

            // Act, Assert
            testFilter(filter, new TaskBuilder().scheduledDate(null), false);
            testFilter(filter, new TaskBuilder().startDate(null), false);
            testFilter(filter, new TaskBuilder().dueDate(null), false);

            // scheduled, start and due all contribute to happens:
            testFilter(filter, new TaskBuilder().scheduledDate(testDate), expected);
            testFilter(filter, new TaskBuilder().startDate(testDate), expected);
            testFilter(filter, new TaskBuilder().dueDate(testDate), expected);

            // Done date is ignored by happens
            testFilter(filter, new TaskBuilder().doneDate(testDate), false);

            jest.useRealTimers();
        },
    );
});

describe('accessing earliest happens date', () => {
    it('should return null if no dates set', () => {
        expect(new HappensDateField().earliestDate(new TaskBuilder().build())).toBeNull();
    });

    function checkEarliestHappensDate(taskBuilder: TaskBuilder, expectedEarliestHappensDate: string) {
        const earliest = new HappensDateField().earliestDate(taskBuilder.build());
        expect({
            earliest: earliest?.format('YYYY-MM-DD'),
        }).toMatchObject({
            earliest: expectedEarliestHappensDate,
        });
    }

    it('should return due if only date set', () => {
        checkEarliestHappensDate(new TaskBuilder().dueDate('1989-12-17'), '1989-12-17');
    });

    it('should return start if only date set', () => {
        checkEarliestHappensDate(new TaskBuilder().startDate('1989-12-17'), '1989-12-17');
    });

    it('should return scheduled if only date set', () => {
        checkEarliestHappensDate(new TaskBuilder().scheduledDate('1989-12-17'), '1989-12-17');
    });

    it('should return earliest if all dates set', () => {
        checkEarliestHappensDate(
            new TaskBuilder().dueDate('1989-12-17').startDate('1999-12-17').scheduledDate('2009-12-17'),
            '1989-12-17',
        );
    });
});

describe('explain happens date queries', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should explain date before', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is before 2023-01-02 (Monday 2nd January 2023)',
        );
    });

    it('should explain date with explicit on', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens on 2024-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is on 2024-01-02 (Tuesday 2nd January 2024)',
        );
    });

    it('should explain date with implicit on', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens 2024-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is on 2024-01-02 (Tuesday 2nd January 2024)',
        );
    });

    it('should show value of relative dates', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens after today');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is after 2022-01-15 (Saturday 15th January 2022)',
        );
    });

    it.each([
        [
            'happens in this week',
            'due, start or scheduled date is between 2022-01-10 (Monday 10th January 2022) and 2022-01-16 (Sunday 16th January 2022) inclusive',
        ],
        [
            'happens in this month',
            'due, start or scheduled date is between 2022-01-01 (Saturday 1st January 2022) and 2022-01-31 (Monday 31st January 2022) inclusive',
        ],
        [
            'happens in this quarter',
            'due, start or scheduled date is between 2022-01-01 (Saturday 1st January 2022) and 2022-03-31 (Thursday 31st March 2022) inclusive',
        ],
        [
            'happens in this half',
            'due, start or scheduled date is between 2022-01-01 (Saturday 1st January 2022) and 2022-06-30 (Thursday 30th June 2022) inclusive',
        ],
        [
            'happens in this year',
            'due, start or scheduled date is between 2022-01-01 (Saturday 1st January 2022) and 2022-12-31 (Saturday 31st December 2022) inclusive',
        ],
    ])('explains "%s" as "%s"', (filter: string, expectedExpanation: string) => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage(filter);
        expect(filterOrMessage).toHaveExplanation(expectedExpanation);
    });
});

describe('sorting by happens', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new HappensDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    const date1 = new TaskBuilder().startDate('2021-01-12').build();
    const date2 = new TaskBuilder().scheduledDate('2022-12-23').build();

    it('sort by happens', () => {
        CustomMatchersForSorting.expectTaskComparesBefore(new HappensDateField().createNormalSorter(), date1, date2);
    });

    it('sort by happens reverse', () => {
        CustomMatchersForSorting.expectTaskComparesAfter(new HappensDateField().createReverseSorter(), date1, date2);
    });
});
