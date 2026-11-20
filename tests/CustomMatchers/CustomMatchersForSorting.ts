import type moment from 'moment';
import { DateParser } from 'DateTime/DateParser';
import type { Sorter } from 'Query/Sort/Sorter';
import type { Task } from 'Task/Task';
import { compareByDate, getDateFormat } from 'DateTime/DateTools';
import { SearchInfo } from 'Query/SearchInfo';
import { createTestTasksFile } from '../TestingTools/TasksFileHelpers';

declare module 'vitest' {
    interface Matchers<R> {
        toBeSorted(): R; // see https://www.npmjs.com/package/jest-sorted
        toGiveCompareToResult(expected: -1 | 0 | 1): R;
        toCompareTasksWithResult(expected: -1 | 0 | 1): R;
    }
}

type DateOrString = string | moment.Moment | null;

function formatDateForMessage(date: DateOrString): string {
    if (typeof date === 'string' || date === null) {
        return `${date}`;
    }
    return date.isValid() ? date.format(getDateFormat(date)) : 'Invalid date';
}

expect.extend({
    toGiveCompareToResult(dates: DateOrString[], expected: -1 | 0 | 1) {
        expect(dates.length).toEqual(2);

        const dateA = dates[0];
        const dateB = dates[1];

        const a = typeof dateA === 'string' ? DateParser.parseDate(dateA) : dateA;
        const b = typeof dateB === 'string' ? DateParser.parseDate(dateB) : dateB;

        const actual = compareByDate(a, b);

        const pass = actual === expected;
        const message = () =>
            `${formatDateForMessage(dateA)} < ${formatDateForMessage(dateB)}: expected=${expected} actual=${actual}`;

        return { pass, message };
    },

    toCompareTasksWithResult({ sorting: sorting, tasks: tasks }, expected: -1 | 0 | 1) {
        expect(tasks.length).toEqual(2);
        const taskA = tasks[0];
        const taskB = tasks[1];
        const actual = sorting.comparator(taskA, taskB, new SearchInfo(createTestTasksFile('dummy path.md'), tasks));

        let pass;
        let expectedDesription: string;
        switch (expected) {
            case -1:
                pass = actual < 0;
                expectedDesription = 'should be less than 0';
                break;
            case 0:
                pass = actual === 0;
                expectedDesription = 'should equal 0';
                break;
            case +1:
                pass = actual > 0;
                expectedDesription = 'should be more than 0';
                break;
        }

        const message = () => `
"${taskA.toFileLineString()}" <
"${taskB.toFileLineString()}"
  expect comparator result: "${expectedDesription}";
  actual comparator result: ${actual}`;

        return { pass, message };
    },
});

const equal = 0;
const after = 1; // This will actually pass if the comparator returns any value ABOVE 0;
const before = -1; // This will actually pass if the comparator returns any value BELOW 0;

// ---------------------------------------------------------------------
// Sorting Dates
// ---------------------------------------------------------------------
export function expectDateComparesBefore(dateA: DateOrString, dateB: DateOrString) {
    testCompareByDateBothWays(dateA, dateB, before);
}

export function expectDateComparesEqual(dateA: DateOrString, dateB: DateOrString) {
    testCompareByDateBothWays(dateA, dateB, equal);
}

export function expectDateComparesAfter(dateA: DateOrString, dateB: DateOrString) {
    testCompareByDateBothWays(dateA, dateB, after);
}

function testCompareByDateBothWays(dateA: DateOrString, dateB: DateOrString, expected: -1 | 0 | 1) {
    expect([dateA, dateB]).toGiveCompareToResult(expected);

    const reverseExpected = expected === equal ? equal : expected === before ? after : before;
    expect([dateB, dateA]).toGiveCompareToResult(reverseExpected);
}

// ---------------------------------------------------------------------
// Sorting Tasks
// ---------------------------------------------------------------------

export function expectTaskComparesBefore(sorter: Sorter, taskA: Task, taskB: Task) {
    testCompareTasksBothWays(sorter, taskA, taskB, before);
}

export function expectTaskComparesEqual(sorter: Sorter, taskA: Task, taskB: Task) {
    testCompareTasksBothWays(sorter, taskA, taskB, equal);
}

export function expectTaskComparesAfter(sorter: Sorter, taskA: Task, taskB: Task) {
    testCompareTasksBothWays(sorter, taskA, taskB, after);
}

function testCompareTasksBothWays(sorter: Sorter, taskA: Task, taskB: Task, expected: -1 | 0 | 1) {
    expect({ sorting: sorter, tasks: [taskA, taskB] }).toCompareTasksWithResult(expected);

    const reverseExpected = expected === equal ? equal : expected === before ? after : before;
    expect({ sorting: sorter, tasks: [taskB, taskA] }).toCompareTasksWithResult(reverseExpected);
}
