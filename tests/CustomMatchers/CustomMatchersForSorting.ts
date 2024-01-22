import type moment from 'moment';
import { DateParser } from '../../src/Query/DateParser';
import type { Sorter } from '../../src/Query/Sort/Sorter';
import type { Task } from '../../src/Task/Task';
import { compareByDate } from '../../src/lib/DateTools';
import { SearchInfo } from '../../src/Query/SearchInfo';

declare global {
    namespace jest {
        interface Matchers<R> {
            toGiveCompareToResult(expected: number): R;
            toCompareTasksWithResult(expected: number): R;
        }
    }
}

expect.extend({
    toGiveCompareToResult(dates: (string | null)[], expected: -1 | 0 | 1) {
        expect(dates.length).toEqual(2);

        const dateA = dates[0];
        const dateB = dates[1];

        let a: moment.Moment | null = null;
        if (dateA !== null) a = DateParser.parseDate(dateA);

        let b: moment.Moment | null = null;
        if (dateB !== null) b = DateParser.parseDate(dateB);

        const actual = compareByDate(a, b);

        const pass = actual === expected;
        const message = () => `${dateA} < ${dateB}: expected=${expected} actual=${actual}`;

        return { pass, message };
    },

    toCompareTasksWithResult({ sorting: sorting, tasks: tasks }, expected: -1 | 0 | 1) {
        expect(tasks.length).toEqual(2);
        const taskA = tasks[0];
        const taskB = tasks[1];
        const actual = sorting.comparator(taskA, taskB, new SearchInfo('dummy path.md', tasks));

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
export function expectDateComparesBefore(dateA: string | null, dateB: string | null) {
    testCompareByDateBothWays(dateA, dateB, before);
}

export function expectDateComparesEqual(dateA: string | null, dateB: string | null) {
    testCompareByDateBothWays(dateA, dateB, equal);
}

export function expectDateComparesAfter(dateA: string | null, dateB: string | null) {
    testCompareByDateBothWays(dateA, dateB, after);
}

function testCompareByDateBothWays(dateA: string | null, dateB: string | null, expected: -1 | 0 | 1) {
    expect([dateA, dateB]).toGiveCompareToResult(expected);

    const reverseExpected = expected === equal ? equal : -expected;
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

    const reverseExpected = expected === equal ? equal : -expected;
    expect({ sorting: sorter, tasks: [taskB, taskA] }).toCompareTasksWithResult(reverseExpected);
}
