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

describe('due date with natural date ranges', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 4, 25)); // 2022-05-25
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('by due date (before this month)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before this month');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-30', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-01', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-31', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-01', false);
    });

    it('by due date (on this month)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due on this month');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-30', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-01', false);
    });

    it('by due date (after this month)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due after this month');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-30', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-01', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-31', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-01', true);
    });

    it('by due date (in this month)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due in this month');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-30', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-01', false);
    });

    it('by due date (this month)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due this month');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-30', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-01', false);
    });

    it('by due date (last week)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due last week');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-15', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-16', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-22', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-23', false);
    });

    it('by due date (this week)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due this week');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-22', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-23', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-29', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-30', false);
    });

    it('by due date (next week)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due next week');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-29', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-05-30', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-05', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-06', false);
    });

    it('by due date (this quarter)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due this quarter');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-03-31', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-06-30', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-07-01', false);
    });

    it('by due date (this year)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due this year');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2021-12-31', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-01-01', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-12-31', true);
        testTaskFilterForTaskWithDueDate(filter, '2023-01-01', false);
    });

    it('should explain natural date (week)', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due this week');
        expect(filterOrMessage).toHaveExplanation(
            'due date is between 2022-05-23 (Monday 23rd May 2022) and 2022-05-29 (Sunday 29th May 2022) inclusive',
        );
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
