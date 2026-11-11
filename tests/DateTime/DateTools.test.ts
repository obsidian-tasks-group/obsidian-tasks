import moment from 'moment';

// begin-snippet: fix-window.moment-calls-in-tests
window.moment = moment;
// end-snippet

import { datesAreIdentical, getDateFormat, hasTime, momentWithFormat, preserveTime } from 'DateTime/DateTools';
import { TaskRegularExpressions } from 'Task/TaskRegularExpressions';
import {
    expectDateComparesAfter,
    expectDateComparesBefore,
    expectDateComparesEqual,
} from '../CustomMatchers/CustomMatchersForSorting';
import { withTimezone } from '../TestingTools/DateTestHelpers';

const dateFormat = TaskRegularExpressions.dateFormat;
const dateTimeFormat = TaskRegularExpressions.dateTimeFormat;

function getDateOnly(dateString: string): moment.Moment {
    return momentWithFormat(window.moment(dateString), dateFormat);
}

function getDateAndTime(dateAndTimeString: string): moment.Moment {
    return momentWithFormat(window.moment(dateAndTimeString), dateTimeFormat);
}

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

    it('should order a date-only value before a timed value on the same day', () => {
        const dateOnly = getDateOnly('2026-10-23');
        const morning = getDateAndTime('2026-10-23 09:00');
        const midnightTimed = getDateAndTime('2026-10-23 00:00');

        expectDateComparesBefore(dateOnly, morning);
        // Deliberate: compareByDate() compares by Moment timestamp, and a date-only Moment is at 00:00:00,
        // so it sorts before times after midnight (00:00 < 09:00) and compares equal to an explicit 00:00
        // on the same day (leaving midnight tie-breaking to subsequent sort keys):
        expectDateComparesEqual(dateOnly, midnightTimed);
    });

    it('should order two timed values by time', () => {
        const morning = getDateAndTime('2026-10-23 09:00');
        const afternoon = getDateAndTime('2026-10-23 14:30');

        expectDateComparesBefore(morning, afternoon);
        expectDateComparesEqual(morning, morning.clone());
    });
});

describe('datesAreIdentical', () => {
    it('should be true for two nulls', () => {
        expect(datesAreIdentical(null, null)).toBe(true);
    });

    it('should be false for null versus a date', () => {
        const date = getDateOnly('2026-10-23');
        expect(datesAreIdentical(null, date)).toBe(false);
        expect(datesAreIdentical(date, null)).toBe(false);
    });

    it('should be true for equal timed values', () => {
        const a = getDateAndTime('2026-10-23 14:30');
        const b = getDateAndTime('2026-10-23 14:30');
        expect(datesAreIdentical(a, b)).toBe(true);
    });

    it('should be false for different times on the same day', () => {
        const morning = getDateAndTime('2026-10-23 09:00');
        const afternoon = getDateAndTime('2026-10-23 14:30');
        expect(datesAreIdentical(morning, afternoon)).toBe(false);
    });

    it('should be false for date-only versus the same day at 00:00', () => {
        const dateOnly = getDateOnly('2026-10-23');
        const midnightTimed = getDateAndTime('2026-10-23 00:00');
        expect(datesAreIdentical(dateOnly, midnightTimed)).toBe(false);
        expect(datesAreIdentical(midnightTimed, dateOnly)).toBe(false);
    });

    it('should treat two invalid dates consistently', () => {
        const invalidDateOnly = window.moment('2026-02-30', dateFormat, true);
        const invalidTimed = window.moment('2026-02-30 14:30', dateTimeFormat, true);
        const validDate = getDateOnly('2026-10-23');

        expect(datesAreIdentical(invalidDateOnly, invalidDateOnly.clone())).toBe(true);
        expect(datesAreIdentical(invalidDateOnly, invalidTimed)).toBe(true);
        expect(datesAreIdentical(invalidDateOnly, validDate)).toBe(false);
        expect(datesAreIdentical(invalidDateOnly, null)).toBe(false);
    });
});

describe('hasTime', () => {
    it('should return false for null', () => {
        expect(hasTime(null)).toBe(false);
    });

    it('should return false for an invalid date', () => {
        expect(hasTime(window.moment('2026-02-30', dateFormat, true))).toBe(false);
        expect(hasTime(window.moment('2026-02-30 14:30', dateTimeFormat, true))).toBe(false);
        expect(hasTime(window.moment('2022-13-45 11:30', dateTimeFormat, true))).toBe(false);
    });

    it('should return false for a date-only value', () => {
        const dateOnly = getDateOnly('2026-10-23');
        expect(hasTime(dateOnly)).toBe(false);
    });

    it('should return true for a YYYY-MM-DD HH:mm value', () => {
        const timed = getDateAndTime('2026-10-23 14:30');
        expect(hasTime(timed)).toBe(true);
    });

    it('should return true for a timed value at 00:00', () => {
        const midnightTimed = getDateAndTime('2026-10-23 00:00');
        expect(hasTime(midnightTimed)).toBe(true);
    });

    it('should return false for a date-only value after startOf("day")', () => {
        const dateOnly = getDateOnly('2026-10-23').startOf('day');
        expect(hasTime(dateOnly)).toBe(false);
    });

    it('should return false for a T-separated ISO string', () => {
        expect(hasTime(window.moment('2026-10-23T14:30'))).toBe(false);
    });
});

describe('getDateFormat', () => {
    it('should return the date-only format for null', () => {
        expect(getDateFormat(null)).toBe(dateFormat);
    });

    it('should return the date-only format for a date-only value', () => {
        const dateOnly = getDateOnly('2026-10-23');
        expect(getDateFormat(dateOnly)).toBe(dateFormat);
    });

    it('should return the timed format for a timed value', () => {
        const timed = getDateAndTime('2026-10-23 14:30');
        expect(getDateFormat(timed)).toBe(dateTimeFormat);
    });
});

describe('momentWithFormat', () => {
    it('should create a valid moment whose creationData().format is the requested format', () => {
        const dateOnly = momentWithFormat(window.moment('2026-10-23 14:30'), dateFormat);
        expect(dateOnly.isValid()).toBe(true);
        expect(dateOnly.creationData().format).toBe(dateFormat);

        const timed = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
        expect(timed.isValid()).toBe(true);
        expect(timed.creationData().format).toBe(dateTimeFormat);
    });

    it('should accept a Date and a moment', () => {
        const fromDate = momentWithFormat(new Date(2026, 9, 23, 14, 30), dateTimeFormat);
        const fromMoment = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);

        expect(fromDate.format(dateTimeFormat)).toBe('2026-10-23 14:30');
        expect(fromMoment.format(dateTimeFormat)).toBe('2026-10-23 14:30');
    });

    it('should round-trip the formatted string', () => {
        const timed = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
        expect(timed.format(getDateFormat(timed))).toBe('2026-10-23 14:30');

        const dateOnly = momentWithFormat(window.moment('2026-10-23 14:30'), dateFormat);
        expect(dateOnly.format(getDateFormat(dateOnly))).toBe('2026-10-23');
    });
});

describe('preserveTime', () => {
    it('should return a clone of the target unchanged when the source is null, invalid or date-only', () => {
        const target = getDateOnly('2026-10-30');
        const invalidSource = window.moment('2026-02-30 14:30', dateTimeFormat, true);
        const dateOnlySource = getDateOnly('2026-10-23');

        for (const source of [null, invalidSource, dateOnlySource]) {
            const result = preserveTime(target, source);
            expect(datesAreIdentical(result, target)).toBe(true);
            expect(result).not.toBe(target);
        }
    });

    it("should keep a timed target's time when the source is null, invalid or date-only", () => {
        const timedTarget = getDateAndTime('2026-10-30 09:00');
        const invalidSource = window.moment('2026-02-30 14:30', dateTimeFormat, true);
        const dateOnlySource = getDateOnly('2026-10-23');

        for (const source of [null, invalidSource, dateOnlySource]) {
            const result = preserveTime(timedTarget, source);
            expect(datesAreIdentical(result, timedTarget)).toBe(true);
            expect(result.format(dateTimeFormat)).toBe('2026-10-30 09:00');
            expect(result).not.toBe(timedTarget);
        }
    });

    it('should copy hour, minute and format from a timed source', () => {
        const target = getDateOnly('2026-10-30');
        const source = getDateAndTime('2026-10-23 14:30');

        const result = preserveTime(target, source);

        expect(result.hour()).toBe(14);
        expect(result.minute()).toBe(30);
        expect(getDateFormat(result)).toBe(dateTimeFormat);
    });

    it("should keep the target's calendar date", () => {
        const target = getDateOnly('2026-10-30');
        const source = getDateAndTime('2026-10-23 14:30');

        const result = preserveTime(target, source);

        expect(result.format(dateTimeFormat)).toBe('2026-10-30 14:30');
    });

    it('should keep a source time of 00:00', () => {
        const target = getDateOnly('2026-10-30');
        const source = getDateAndTime('2026-10-23 00:00');

        const result = preserveTime(target, source);

        expect(hasTime(result)).toBe(true);
        expect(result.format(dateTimeFormat)).toBe('2026-10-30 00:00');
    });

    it('should not mutate the target or the source', () => {
        const target = getDateOnly('2026-10-30');
        const source = getDateAndTime('2026-10-23 14:30');

        preserveTime(target, source);

        expect(hasTime(target)).toBe(false);
        expect(target.format(dateFormat)).toBe('2026-10-30');
        expect(source.format(dateTimeFormat)).toBe('2026-10-23 14:30');
    });

    it('should shift a non-existent time forward by one hour on the spring-forward day in America/New_York', () => {
        withTimezone('America/New_York', () => {
            // In America/New_York, DST springs forward at 02:00 -> 03:00 on 2026-03-08,
            // so 02:30 does not exist on 2026-03-08 and is normalized forward to 03:30 EDT (UTC-4):
            const source = getDateAndTime('2026-03-07 02:30');
            const target = getDateOnly('2026-03-08');

            const result = preserveTime(target, source);

            expect(result.isValid()).toBe(true);
            expect(hasTime(result)).toBe(true);
            expect(result.format(dateTimeFormat)).toBe('2026-03-08 03:30');
            expect(result.utcOffset()).toBe(-240);
        });
    });

    it('should preserve the wall-clock time and pick the first (EDT) occurrence on the fall-back day in America/New_York', () => {
        withTimezone('America/New_York', () => {
            // In America/New_York, DST falls back at 02:00 EDT -> 01:00 EST on 2026-11-01,
            // so 01:30 occurs twice (first in EDT at UTC-4, then in EST at UTC-5).
            // Moment preserves 01:30 and selects the first (EDT, UTC-4) occurrence:
            const source = getDateAndTime('2026-10-31 01:30');
            const target = getDateOnly('2026-11-01');

            const result = preserveTime(target, source);

            expect(result.isValid()).toBe(true);
            expect(hasTime(result)).toBe(true);
            expect(result.format(dateTimeFormat)).toBe('2026-11-01 01:30');
            expect(result.utcOffset()).toBe(-240);
        });
    });
});
