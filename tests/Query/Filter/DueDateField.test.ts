/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { Query } from '../../../src/Query/Query';
import { MarkdownTable } from '../../TestingTools/VerifyMarkdownTable';

window.moment = moment;

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

    it('by due date - before inclusive range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date - on inclusive range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date - after inclusive range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due after 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', true);
    });

    it('by due date - in inclusive range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due in 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('by due date - inclusive range', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due 2022-04-20 2022-04-24');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-19', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-24', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });
});

describe('due date before natural date range (Today is 2022-05-25)', () => {
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

    it('should explain natural date range', () => {
        const filterW = new DueDateField().createFilterOrErrorMessage('due before this week');
        expect(filterW).toHaveExplanation('due date is before 2022-05-23 (Monday 23rd May 2022)');

        const filterM = new DueDateField().createFilterOrErrorMessage('due before this month');
        expect(filterM).toHaveExplanation('due date is before 2022-05-01 (Sunday 1st May 2022)');

        const filterQ = new DueDateField().createFilterOrErrorMessage('due before this quarter');
        expect(filterQ).toHaveExplanation('due date is before 2022-04-01 (Friday 1st April 2022)');

        const filterY = new DueDateField().createFilterOrErrorMessage('due before this year');
        expect(filterY).toHaveExplanation('due date is before 2022-01-01 (Saturday 1st January 2022)');
    });
});

describe('due date in natural date range (Today is 2023-02-28)', () => {
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
        'due (in|on|) %s: task with due date %s not included, %s and %s incuded, %s not included again',
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
});

describe('due date after natural date range (Today is 2021-11-01)', () => {
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
        'due after %s: task with due date %s, %s, %s are not incuded, %s is',
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

    it('should explain natural date range', () => {
        const filterW = new DueDateField().createFilterOrErrorMessage('due after this week');
        expect(filterW).toHaveExplanation('due date is after 2021-11-07 (Sunday 7th November 2021)');

        const filterM = new DueDateField().createFilterOrErrorMessage('due after this month');
        expect(filterM).toHaveExplanation('due date is after 2021-11-30 (Tuesday 30th November 2021)');

        const filterQ = new DueDateField().createFilterOrErrorMessage('due after this quarter');
        expect(filterQ).toHaveExplanation('due date is after 2021-12-31 (Friday 31st December 2021)');

        const filterY = new DueDateField().createFilterOrErrorMessage('due after this year');
        expect(filterY).toHaveExplanation('due date is after 2021-12-31 (Friday 31st December 2021)');
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
            'due date is between 2022-11-25 (Friday 25th November 2022) and 2023-01-17 (Tuesday 17th January 2023) inclusive',
        );
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
                const query = new Query({ source: `due ${keyword}${date}` });
                expect(query.error).toBeUndefined();

                newRow.push(query.explainQueryWithoutIntroduction().replace(/(\n)/g, '<br>'));
            });

            table.addRow(newRow);
        });

        table.verify();
    });
});
