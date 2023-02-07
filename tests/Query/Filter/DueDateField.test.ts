/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

function testTaskFilterForTaskWithDueDate(filter: FilterOrErrorMessage, dueDate: string | null, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.dueDate(dueDate), expected);
}

describe('due date', () => {
    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('due date is invalid', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due date is invalid');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-02-30', true); // 30 February is not valid
        testTaskFilterForTaskWithDueDate(filter, '2022-00-01', true); // month 0 not valid
        testTaskFilterForTaskWithDueDate(filter, '2022-13-01', true); // month 13 not valid
    });

    it.each([
        // Week
        ['due in current week', '2022-01-09 (Sunday 9th January 2022)', false],
        ['due in current week', '2022-01-10 (Monday 10th January 2022)', true],
        ['due in current week', '2022-01-16 (Sunday 16th January 2022)', true],
        ['due in current week', '2022-01-17 (Monday 16th January 2022)', false],

        // Month
        ['due in current month', '2021-12-31 (Friday 31st December 2021)', false],
        ['due in current month', '2022-01-01 (Saturday 1st January 2022)', true],
        ['due in current month', '2022-01-31 (Monday 31st January 2022)', true],
        ['due in current month', '2022-02-01 (Tuesday 1st February 2022)', false],

        // Year
        ['due in current year', '2021-12-31 (Friday 31st December 2021)', false],
        ['due in current year', '2022-01-01 (Saturday 1st January 2022)', true],
        ['due in current year', '2022-12-31 (Saturday 31st December 2022)', true],
        ['due in current year', '2023-01-01 (Sunday 1st January 2023)', false],
    ])(
        '"%s" expect a task with "%s" date in due field to be "%s"',
        (filterString: string, testDate: string, expected: boolean) => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15

            const filter = new DueDateField().createFilterOrErrorMessage(filterString);

            testFilter(filter, new TaskBuilder().dueDate(null), false);
            testFilter(filter, new TaskBuilder().dueDate(testDate), expected);

            jest.useRealTimers();
        },
    );
});

describe('explain due date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('due date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('due date is on 2023-01-02 (Monday 2nd January 2023)');
    });

    it.each([
        [
            'due in current week',
            'due date is between 2022-01-10 (Monday 10th January 2022) and 2022-01-16 (Sunday 16th January 2022) inclusive',
        ],
        [
            'due in current month',
            'due date is between 2022-01-01 (Saturday 1st January 2022) and 2022-01-31 (Monday 31st January 2022) inclusive',
        ],
        [
            'due in current year',
            'due date is between 2022-01-01 (Saturday 1st January 2022) and 2022-12-31 (Saturday 31st December 2022) inclusive',
        ],
    ])('explains "%s" as "%s"', (filter: string, expectedExpanation: string) => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15

        const filterOrMessage = new DueDateField().createFilterOrErrorMessage(filter);
        expect(filterOrMessage).toHaveExplanation(expectedExpanation);

        jest.useRealTimers();
    });
});

describe('sorting by due', () => {
    const date1 = new TaskBuilder().dueDate('2021-01-12').build();
    const date2 = new TaskBuilder().dueDate('2022-12-23').build();

    it('supports Field sorting methods correctly', () => {
        const field = new DueDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('sort by due', () => {
        // Arrange
        const sorter = new DueDateField().createNormalSorter();

        // Assert
        expectTaskComparesBefore(sorter, date1, date2);
        expectTaskComparesAfter(sorter, date2, date1);
        expectTaskComparesEqual(sorter, date2, date2);
    });

    it('sort by due reverse', () => {
        // Arrange
        const sorter = new DueDateField().createReverseSorter();

        // Assert
        expectTaskComparesAfter(sorter, date1, date2);
        expectTaskComparesBefore(sorter, date2, date1);
        expectTaskComparesEqual(sorter, date2, date2);
    });
});
