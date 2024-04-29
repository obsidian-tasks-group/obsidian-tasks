/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { Query } from '../../../src/Query/Query';
import { verifyMarkdown } from '../../TestingTools/VerifyMarkdown';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { MarkdownTable } from '../../../src/lib/MarkdownTable';
import { Explainer } from '../../../src/Query/Explain/Explainer';

window.moment = moment;

function testTaskFilterForTaskWithDueDate(filter: FilterOrErrorMessage, dueDate: string | null, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.dueDate(dueDate), expected);
}

describe('due date', () => {
    afterAll(() => {
        jest.useRealTimers();
    });

    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date (on or before) should match the given date and all earlier dates', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on or before 2023-08-01');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2023-07-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-08-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-08-02', false);
    });

    it('by due date (on or after) should match the given date and all later dates', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on or after 2022-02-01');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-01-31', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-02-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-02-02', true);
    });

    it('by due date - before absolute range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date - on or before absolute range should match the date range and all earlier dates', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on or before 2021-07-10 2021-10-04');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2021-07-09', true);
        testTaskFilterForTaskWithDueDate(filter, '2021-07-10', true);
        testTaskFilterForTaskWithDueDate(filter, '2021-10-04', true);
        testTaskFilterForTaskWithDueDate(filter, '2021-10-05', false);
    });

    it('by due date - on absolute range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date - on or after absolute range should match the date range and all later dates', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on or after 2023-03-10 2023-04-01');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2023-03-09', false);
        testTaskFilterForTaskWithDueDate(filter, '2023-03-10', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-04-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-04-02', true);
    });

    it('by due date - after absolute range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due after 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', true);
    });

    it('by due date - in absolute range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due in 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date - absolute range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('due in two weeks', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2023, 3 - 1, 6));

        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due in two weeks');
        expect(filterOrMessage).toHaveExplanation('due date is on 2023-03-20 (Monday 20th March 2023)');
    });
});

describe('due date (specific ranges)', () => {
    it('due in specific range (year)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2022');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2021-12-31', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-01-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-12-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-01-01', false);
    });

    it('due in specific range (quarter)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2017-Q3');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2017-06-30', false);
        testTaskFilterForTaskWithDueDate(filter, '2017-07-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2017-09-30', true);
        testTaskFilterForTaskWithDueDate(filter, '2017-10-01', false);
    });

    it('due in specific range (month)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2020-03');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2020-02-28', false);
        testTaskFilterForTaskWithDueDate(filter, '2020-03-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2020-03-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2020-04-01', false);
    });

    it('due in specific range (week)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2023-W09');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2023-02-26', false);
        testTaskFilterForTaskWithDueDate(filter, '2023-02-27', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-03-05', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-03-06', false);
    });
});

describe('due date (error & corner cases)', () => {
    it('invalid due date', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due date is invalid');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-02-30', true); // 30 February is not valid
        testTaskFilterForTaskWithDueDate(filter, '2022-00-01', true); // month 0 not valid
        testTaskFilterForTaskWithDueDate(filter, '2022-13-01', true); // month 13 not valid
    });

    it('date range with both dates invalid', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due date 2023-13-01 2022-01-78');

        // Act, Assert
        expect(filter.filterFunction).toBeUndefined();
        expect(filter.error).toBeDefined();
    });

    it('date range with first date invalid treated as a date', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due date 2023-13-01 2022-01-07');

        // Act, Assert
        // Currently the invalid date is ignored and date range is treated as a date
        expect(filter).toHaveExplanation('due date is on 2022-01-07 (Friday 7th January 2022)');
    });

    it('date range with second date invalid treated as a date', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due date 2023-12-01 2022-01-78');

        // Act, Assert
        // Currently the invalid date is ignored and date range is treated as a date
        expect(filter).toHaveExplanation('due date is on 2023-12-01 (Friday 1st December 2023)');
    });

    it('date range with invalid relative date range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due thees week');

        // Act, Assert
        expect(filter.filterFunction).toBeUndefined();
        expect(filter.error).toBeDefined();
    });

    it('before reversed range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before 2022-04-24 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('in reversed range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2022-04-24 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('after reversed range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due after 2022-04-24 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', true);
    });
});

describe('due date before relative date range (Today is 2022-05-25)', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 4, 25)); // 2022-05-25
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it.each([
        // Week
        ['last week', '2022-05-15', '2022-05-16', '2022-05-22', '2022-05-23'],
        ['this week', '2022-05-22', '2022-05-23', '2022-05-29', '2022-05-30'],
        ['next week', '2022-05-29', '2022-05-30', '2022-06-05', '2022-06-06'],

        // Month
        ['last month', '2022-03-31', '2022-04-01', '2022-04-30', '2022-05-01'],
        ['this month', '2022-04-30', '2022-05-01', '2022-05-31', '2022-06-01'],
        ['next month', '2022-05-31', '2022-06-01', '2022-06-30', '2022-07-01'],

        // Quarter
        ['last quarter', '2021-12-31', '2022-01-01', '2022-03-31', '2022-04-01'],
        ['this quarter', '2022-03-31', '2022-04-01', '2022-06-30', '2022-07-01'],
        ['next quarter', '2022-06-30', '2022-07-01', '2022-09-30', '2022-10-01'],

        // Year
        ['last year', '2020-12-31', '2021-01-01', '2021-12-31', '2022-01-01'],
        ['this year', '2021-12-31', '2022-01-01', '2022-12-31', '2023-01-01'],
        ['next year', '2022-12-31', '2023-01-01', '2023-12-31', '2024-01-01'],
    ])(
        'due before %s: task with due date on %s is included; %s, %s, %s are not',
        (range: string, beforeRange: string, rangeStart: string, rangeEnd: string, afterRange: string) => {
            // Arrange
            const filter = new DueDateField().createFilterOrErrorMessage(`due before ${range}`);

            // Act, Assert
            testTaskFilterForTaskWithDueDate(filter, null, false);
            testTaskFilterForTaskWithDueDate(filter, beforeRange, true);
            testTaskFilterForTaskWithDueDate(filter, rangeStart, false);
            testTaskFilterForTaskWithDueDate(filter, rangeEnd, false);
            testTaskFilterForTaskWithDueDate(filter, afterRange, false);
        },
    );

    it.each([
        ['week', '2022-05-23 (Monday 23rd May 2022)'],
        ['month', '2022-05-01 (Sunday 1st May 2022)'],
        ['quarter', '2022-04-01 (Friday 1st April 2022)'],
        ['year', '2022-01-01 (Saturday 1st January 2022)'],
    ])('should explain before relative date range (%s)', (range: string, date: string) => {
        const filter = new DueDateField().createFilterOrErrorMessage(`due before this ${range}`);
        expect(filter).toHaveExplanation(`due date is before ${date}`);
    });
});

describe('due date in relative date range (Today is 2023-02-28)', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2023, 1, 28)); // 2023-02-28
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it.each([
        // Week
        ['last week', '2023-02-19', '2023-02-20', '2023-02-26', '2021-02-27'],
        ['this week', '2023-02-26', '2023-02-27', '2023-03-05', '2021-03-06'],
        ['next week', '2023-03-05', '2023-03-06', '2023-03-12', '2021-03-13'],

        // Month
        ['last month', '2022-12-31', '2023-01-01', '2023-01-31', '2023-02-01'],
        ['this month', '2023-01-31', '2023-02-01', '2023-02-28', '2023-03-01'],
        ['next month', '2023-02-28', '2023-03-01', '2023-03-31', '2023-04-01'],

        // Quarter
        ['last quarter', '2022-09-30', '2022-10-01', '2022-12-31', '2023-01-01'],
        ['this quarter', '2022-12-31', '2023-01-01', '2023-03-31', '2023-04-01'],
        ['next quarter', '2023-03-31', '2023-04-01', '2023-06-30', '2023-07-01'],

        // Year
        ['last year', '2021-12-31', '2022-01-01', '2022-12-31', '2023-01-01'],
        ['this year', '2022-12-31', '2023-01-01', '2023-12-31', '2024-01-01'],
        ['next year', '2023-12-31', '2024-01-01', '2024-12-31', '2025-01-01'],
    ])(
        'due (in|on|) %s: task with due date %s not included, %s and %s included, %s not included again',
        (range: string, beforeRange: string, rangeStart: string, rangeEnd: string, afterRange: string) => {
            // Arrange
            const filterOn = new DueDateField().createFilterOrErrorMessage(`due on ${range}`);
            const filterIn = new DueDateField().createFilterOrErrorMessage(`due in ${range}`);
            const filterEmpty = new DueDateField().createFilterOrErrorMessage(`due ${range}`);

            // Act, Assert
            testTaskFilterForTaskWithDueDate(filterOn, null, false);
            testTaskFilterForTaskWithDueDate(filterOn, beforeRange, false);
            testTaskFilterForTaskWithDueDate(filterOn, rangeStart, true);
            testTaskFilterForTaskWithDueDate(filterOn, rangeEnd, true);
            testTaskFilterForTaskWithDueDate(filterOn, afterRange, false);

            testTaskFilterForTaskWithDueDate(filterIn, null, false);
            testTaskFilterForTaskWithDueDate(filterIn, beforeRange, false);
            testTaskFilterForTaskWithDueDate(filterIn, rangeStart, true);
            testTaskFilterForTaskWithDueDate(filterIn, rangeEnd, true);
            testTaskFilterForTaskWithDueDate(filterIn, afterRange, false);

            testTaskFilterForTaskWithDueDate(filterEmpty, null, false);
            testTaskFilterForTaskWithDueDate(filterEmpty, beforeRange, false);
            testTaskFilterForTaskWithDueDate(filterEmpty, rangeStart, true);
            testTaskFilterForTaskWithDueDate(filterEmpty, rangeEnd, true);
            testTaskFilterForTaskWithDueDate(filterEmpty, afterRange, false);
        },
    );

    it.each([
        ['week', '2023-02-27 (Monday 27th February 2023)', '2023-03-05 (Sunday 5th March 2023)'],
        ['month', '2023-02-01 (Wednesday 1st February 2023)', '2023-02-28 (Tuesday 28th February 2023)'],
        ['quarter', '2023-01-01 (Sunday 1st January 2023)', '2023-03-31 (Friday 31st March 2023)'],
        ['year', '2023-01-01 (Sunday 1st January 2023)', '2023-12-31 (Sunday 31st December 2023)'],
    ])('should explain in a relative date range (%s)', (range: string, dateStart: string, dateEnd: string) => {
        const filterOn = new DueDateField().createFilterOrErrorMessage(`due on this ${range}`);
        const filterIn = new DueDateField().createFilterOrErrorMessage(`due in this ${range}`);
        const filterEmpty = new DueDateField().createFilterOrErrorMessage(`due this ${range}`);

        const expectedExplanation = `due date is between:
  ${dateStart} and
  ${dateEnd} inclusive`;

        expect(filterOn).toHaveExplanation(expectedExplanation);
        expect(filterIn).toHaveExplanation(expectedExplanation);
        expect(filterEmpty).toHaveExplanation(expectedExplanation);
    });
});

describe('due date after relative date range (Today is 2021-11-01)', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 10, 1)); // 2021-11-01
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it.each([
        // Week
        ['last week', '2021-10-24', '2021-10-25', '2021-10-31', '2021-11-01'],
        ['this week', '2021-10-31', '2021-11-01', '2021-11-07', '2021-11-08'],
        ['next week', '2021-11-07', '2021-11-08', '2021-11-14', '2021-11-15'],

        // Month
        ['last month', '2021-09-30', '2021-10-01', '2021-10-30', '2021-11-01'],
        ['this month', '2021-10-31', '2021-11-01', '2021-11-30', '2021-12-01'],
        ['next month', '2021-11-30', '2021-12-01', '2021-12-31', '2022-01-01'],

        // Quarter
        ['last quarter', '2021-06-30', '2021-07-01', '2021-09-30', '2021-10-01'],
        ['this quarter', '2021-09-30', '2021-10-01', '2021-12-31', '2022-01-01'],
        ['next quarter', '2021-12-31', '2022-01-01', '2022-01-31', '2022-04-01'],

        // Year
        ['last year', '2019-12-31', '2020-01-01', '2020-12-31', '2021-01-01'],
        ['this year', '2020-12-31', '2021-01-01', '2021-12-31', '2022-01-01'],
        ['next year', '2021-12-31', '2022-01-01', '2022-12-31', '2023-01-01'],
    ])(
        'due after %s: task with due date %s, %s, %s are not included, %s is',
        (range: string, beforeRange: string, rangeStart: string, rangeEnd: string, afterRange: string) => {
            // Arrange
            const filter = new DueDateField().createFilterOrErrorMessage(`due after ${range}`);

            // Act, Assert
            testTaskFilterForTaskWithDueDate(filter, null, false);
            testTaskFilterForTaskWithDueDate(filter, beforeRange, false);
            testTaskFilterForTaskWithDueDate(filter, rangeStart, false);
            testTaskFilterForTaskWithDueDate(filter, rangeEnd, false);
            testTaskFilterForTaskWithDueDate(filter, afterRange, true);
        },
    );

    it.each([
        ['week', '2021-11-07 (Sunday 7th November 2021)'],
        ['month', '2021-11-30 (Tuesday 30th November 2021)'],
        ['quarter', '2021-12-31 (Friday 31st December 2021)'],
        ['year', '2021-12-31 (Friday 31st December 2021)'],
    ])('should explain after relative date range (%s)', (range: string, date: string) => {
        const filter = new DueDateField().createFilterOrErrorMessage(`due after this ${range}`);
        expect(filter).toHaveExplanation(`due date is after ${date}`);
    });
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

    it('should explain date range', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due 2022-11-25 2023-01-17');
        expect(filterOrMessage).toHaveExplanation(
            `due date is between:
  2022-11-25 (Friday 25th November 2022) and
  2023-01-17 (Tuesday 17th January 2023) inclusive`,
        );
    });

    it('should explain "on or before" with a single date', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due on or before 2023-08-08');
        expect(filterOrMessage).toHaveExplanation('due date is on or before 2023-08-08 (Tuesday 8th August 2023)');
    });

    it('should explain "on or after" with a single date', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due on or after 2023-07-29');
        expect(filterOrMessage).toHaveExplanation('due date is on or after 2023-07-29 (Saturday 29th July 2023)');
    });

    it('should explain "in or before" with an absolute date range', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due in or before 2023-10-20 2023-11-01');
        expect(filterOrMessage).toHaveExplanation('due date is on or before 2023-11-01 (Wednesday 1st November 2023)');
    });

    it('should explain "in or after" with an absolute date range', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due in or after 2023-10-20 2023-11-01');
        expect(filterOrMessage).toHaveExplanation('due date is on or after 2023-10-20 (Friday 20th October 2023)');
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

describe('due date', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2023, 1, 10)); // 2023-02-10
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('approval tests', () => {
        const dates = ['last week', 'this week', 'next week', '2023-02-09', '2023-02-07 2023-02-11'];
        const keywords = ['before ', 'on ', 'after ', 'in ', ''];

        const table = new MarkdownTable(['date / keyword'].concat(dates));

        keywords.forEach((keyword) => {
            const newRow = [keyword];
            dates.forEach((date) => {
                const query = new Query(`due ${keyword}${date}`);
                expect(query.error).toBeUndefined();

                const explainer = new Explainer();
                newRow.push(explainer.explainFilters(query).replace(/(\n)/g, '<br>'));
            });

            table.addRow(newRow);
        });

        verifyMarkdown(table.markdown);
    });
});

describe('grouping by due date', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new DueDateField()).toSupportGroupingWithProperty('due');
    });

    it('group by due date', () => {
        // Arrange
        const grouper = new DueDateField().createNormalGrouper();
        const taskWithDate = new TaskBuilder().dueDate('1970-01-01').build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect({ grouper, tasks: [taskWithDate] }).groupHeadingsToBe(['1970-01-01 Thursday']);
        expect({ grouper, tasks: [taskWithoutDate] }).groupHeadingsToBe(['No due date']);
    });

    it('should sort groups for DueDateField', () => {
        const grouper = new DueDateField().createNormalGrouper();
        const tasks = SampleTasks.withAllRepresentativeDueDates();

        expect({ grouper, tasks }).groupHeadingsToBe([
            '%%0%% Invalid due date',
            '2023-05-30 Tuesday',
            '2023-05-31 Wednesday',
            '2023-06-01 Thursday',
            '2023-06-02 Friday',
            'No due date',
        ]);
    });
});
