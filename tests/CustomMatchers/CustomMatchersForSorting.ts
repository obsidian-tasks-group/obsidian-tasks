import type moment from 'moment';
import { DateParser } from '../../src/Query/DateParser';
import { DateField } from '../../src/Query/Filter/DateField';
import type { Sorting } from '../../src/Query/Sorting';
import type { Task } from '../../src/Task';

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

        const actual = DateField.compareByDate(a, b);

        const pass = actual === expected;
        const message = () => `${dateA} < ${dateB}: expected=${expected} actual=${actual}`;

        return { pass, message };
    },

    toCompareTasksWithResult({ sorting: sorting, tasks: tasks }, expected: -1 | 0 | 1) {
        expect(tasks.length).toEqual(2);
        const taskA = tasks[0];
        const taskB = tasks[1];
        const actual = sorting.comparator(taskA, taskB);
        const pass = actual === expected;
        const message = () => `${taskA} < ${taskB}: expected=${expected} actual=${actual}`;

        return { pass, message };
    },
});

const equal = 0;
const after = 1;
const before = -1;

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

export function expectTaskComparesBefore(sorting: Sorting, taskA: Task, taskB: Task) {
    testCompareTasksBothWays(sorting, taskA, taskB, before);
}

export function expectTaskComparesEqual(sorting: Sorting, taskA: Task, taskB: Task) {
    testCompareTasksBothWays(sorting, taskA, taskB, equal);
}

export function expectTaskComparesAfter(sorting: Sorting, taskA: Task, taskB: Task) {
    testCompareTasksBothWays(sorting, taskA, taskB, after);
}

function testCompareTasksBothWays(sorting: Sorting, taskA: Task, taskB: Task, expected: -1 | 0 | 1) {
    expect({ sorting, tasks: [taskA, taskB] }).toCompareTasksWithResult(expected);

    const reverseExpected = expected === equal ? equal : -expected;
    expect({ sorting, tasks: [taskB, taskA] }).toCompareTasksWithResult(reverseExpected);
}
