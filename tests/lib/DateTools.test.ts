/**
 * @jest-environment jsdom
 */
import moment from 'moment';

// begin-snippet: fix-window.moment-calls-in-tests
window.moment = moment;
// end-snippet

import {
    expectDateComparesAfter,
    expectDateComparesBefore,
    expectDateComparesEqual,
} from '../CustomMatchers/CustomMatchersForSorting';
import { isDateTime } from '../../src/lib/DateTools';

// These are lower-level tests that the Task-based ones above, for ease of test coverage.
describe('compareBy', () => {
    it('compares correctly by date', () => {
        const earlierDate = '2022-01-01';
        const laterDate = '2022-02-01';
        const invalidDate = '2022-02-30';

        expectDateComparesBefore(earlierDate, laterDate);
        expectDateComparesEqual(earlierDate, earlierDate);
        expectDateComparesAfter(laterDate, earlierDate);

        expectDateComparesAfter(null, earlierDate); // no date sorts after valid dates
        expectDateComparesEqual(null, null);

        expectDateComparesBefore(invalidDate, null); // invalid dates sort before no date
        expectDateComparesEqual(invalidDate, invalidDate);
        expectDateComparesBefore(invalidDate, earlierDate); // invalid dates sort before valid ones
        expectDateComparesAfter(laterDate, invalidDate); // invalid dates sort before valid ones
    });
});

describe('isDateTime', () => {
    function checkIsDateTime(input: string | null, expected: boolean) {
        const dateInput = input === null ? null : moment(input);
        expect(isDateTime(dateInput)).toBe(expected);
    }

    it('should detect a date-only value', () => {
        checkIsDateTime('2020-01-27', false);
    });

    it('should detect an invalid date-only value as a date', () => {
        checkIsDateTime('2020-13-27', false);
    });

    it('should treat a null value as not a time', () => {
        checkIsDateTime(null, false);
    });

    it('should detect a date-time value', () => {
        checkIsDateTime('2023-01-27 03:45', true);
    });

    it('should detect a midnight date-time value', () => {
        checkIsDateTime('2023-01-27 00:00', true);
    });

    it('should detect a date-time value from an invalid date', () => {
        checkIsDateTime('2023-02-31 03:45', true);
    });

    it('should detect a date-time value from a differently formatted time', () => {
        checkIsDateTime('2023-02-12 2:45', false);
    });

    it('should detect a date-time value from a 12-hour clock', () => {
        checkIsDateTime('2023-02-12 11:23p', false);
    });

    it('should detect a date-time value from an invalid time', () => {
        checkIsDateTime('2023-02-12 34:67', true);
    });
});
