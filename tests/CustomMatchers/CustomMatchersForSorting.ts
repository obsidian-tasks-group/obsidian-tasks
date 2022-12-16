import type moment from 'moment';
import { DateParser } from '../../src/Query/DateParser';
import { DateField } from '../../src/Query/Filter/DateField';

declare global {
    namespace jest {
        interface Matchers<R> {
            toGiveCompareToResult(expected: number): R;
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
});

const equal = 0;
const after = 1;
const before = -1;

export function testDateComparesBefore(dateA: string | null, dateB: string | null) {
    testCompareByDateBothWays(dateA, dateB, before);
}

export function testDateComparesEqual(dateA: string | null, dateB: string | null) {
    testCompareByDateBothWays(dateA, dateB, equal);
}

export function testDateComparesAfter(dateA: string | null, dateB: string | null) {
    testCompareByDateBothWays(dateA, dateB, after);
}

function testCompareByDateBothWays(dateA: string | null, dateB: string | null, expected: -1 | 0 | 1) {
    expect([dateA, dateB]).toGiveCompareToResult(expected);

    const reverseExpected = expected === equal ? equal : -expected;
    expect([dateB, dateA]).toGiveCompareToResult(reverseExpected);
}
