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
        const dateOnly = momentWithFormat(window.moment('2026-10-23'), dateFormat);
        const morning = momentWithFormat(window.moment('2026-10-23 09:00'), dateTimeFormat);
        const midnightTimed = momentWithFormat(window.moment('2026-10-23 00:00'), dateTimeFormat);

        expectDateComparesBefore(dateOnly, morning);
        // A date-only Moment is at 00:00:00, so it compares equal to an explicit 00:00 on the same day:
        expectDateComparesEqual(dateOnly, midnightTimed);
    });

    it('should order two timed values by time', () => {
        const morning = momentWithFormat(window.moment('2026-10-23 09:00'), dateTimeFormat);
        const afternoon = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);

        expectDateComparesBefore(morning, afternoon);
        expectDateComparesEqual(morning, morning.clone());
    });
});

describe('datesAreIdentical', () => {
    it('should be true for two nulls', () => {
        expect(datesAreIdentical(null, null)).toBe(true);
    });

    it('should be false for null versus a date', () => {
        const date = momentWithFormat(window.moment('2026-10-23'), dateFormat);
        expect(datesAreIdentical(null, date)).toBe(false);
        expect(datesAreIdentical(date, null)).toBe(false);
    });

    it('should be true for equal timed values', () => {
        const a = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
        const b = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
        expect(datesAreIdentical(a, b)).toBe(true);
    });

    it('should be false for different times on the same day', () => {
        const morning = momentWithFormat(window.moment('2026-10-23 09:00'), dateTimeFormat);
        const afternoon = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
        expect(datesAreIdentical(morning, afternoon)).toBe(false);
    });

    it('should be false for date-only versus the same day at 00:00', () => {
        const dateOnly = momentWithFormat(window.moment('2026-10-23'), dateFormat);
        const midnightTimed = momentWithFormat(window.moment('2026-10-23 00:00'), dateTimeFormat);
        expect(datesAreIdentical(dateOnly, midnightTimed)).toBe(false);
        expect(datesAreIdentical(midnightTimed, dateOnly)).toBe(false);
    });

    it('should treat two invalid dates consistently', () => {
        const invalidDateOnly = window.moment('2026-02-30', dateFormat, true);
        const invalidTimed = window.moment('2026-02-30 14:30', dateTimeFormat, true);
        const validDate = momentWithFormat(window.moment('2026-10-23'), dateFormat);

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
    });

    it('should return false for a date-only value', () => {
        const dateOnly = momentWithFormat(window.moment('2026-10-23'), dateFormat);
        expect(hasTime(dateOnly)).toBe(false);
    });

    it('should return true for a YYYY-MM-DD HH:mm value', () => {
        const timed = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
        expect(hasTime(timed)).toBe(true);
    });

    it('should return true for a timed value at 00:00', () => {
        const midnightTimed = momentWithFormat(window.moment('2026-10-23 00:00'), dateTimeFormat);
        expect(hasTime(midnightTimed)).toBe(true);
    });

    it('should return false for a date-only value after startOf("day")', () => {
        const dateOnly = momentWithFormat(window.moment('2026-10-23'), dateFormat).startOf('day');
        expect(hasTime(dateOnly)).toBe(false);
    });
});

describe('getDateFormat', () => {
    it('should return the date-only format for null', () => {
        expect(getDateFormat(null)).toBe(dateFormat);
    });

    it('should return the date-only format for a date-only value', () => {
        const dateOnly = momentWithFormat(window.moment('2026-10-23'), dateFormat);
        expect(getDateFormat(dateOnly)).toBe(dateFormat);
    });

    it('should return the timed format for a timed value', () => {
        const timed = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);
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
    it('should return the target unchanged when the source is null, invalid or date-only', () => {
        const target = momentWithFormat(window.moment('2026-10-30'), dateFormat);
        const invalidSource = window.moment('2026-02-30 14:30', dateTimeFormat, true);
        const dateOnlySource = momentWithFormat(window.moment('2026-10-23'), dateFormat);

        expect(preserveTime(target, null)).toBe(target);
        expect(preserveTime(target, invalidSource)).toBe(target);
        expect(preserveTime(target, dateOnlySource)).toBe(target);
    });

    it('should copy hour, minute and format from a timed source', () => {
        const target = momentWithFormat(window.moment('2026-10-30'), dateFormat);
        const source = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);

        const result = preserveTime(target, source);

        expect(result.hour()).toBe(14);
        expect(result.minute()).toBe(30);
        expect(getDateFormat(result)).toBe(dateTimeFormat);
    });

    it("should keep the target's calendar date", () => {
        const target = momentWithFormat(window.moment('2026-10-30'), dateFormat);
        const source = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);

        const result = preserveTime(target, source);

        expect(result.format(dateTimeFormat)).toBe('2026-10-30 14:30');
    });

    it('should keep a source time of 00:00', () => {
        const target = momentWithFormat(window.moment('2026-10-30'), dateFormat);
        const source = momentWithFormat(window.moment('2026-10-23 00:00'), dateTimeFormat);

        const result = preserveTime(target, source);

        expect(hasTime(result)).toBe(true);
        expect(result.format(dateTimeFormat)).toBe('2026-10-30 00:00');
    });

    it('should not mutate the target or the source', () => {
        const target = momentWithFormat(window.moment('2026-10-30'), dateFormat);
        const source = momentWithFormat(window.moment('2026-10-23 14:30'), dateTimeFormat);

        preserveTime(target, source);

        expect(hasTime(target)).toBe(false);
        expect(target.format(dateFormat)).toBe('2026-10-30');
        expect(source.format(dateTimeFormat)).toBe('2026-10-23 14:30');
    });

    it('should shift a non-existent time forward by one hour on the spring-forward day in America/New_York', () => {
        withTimezone('America/New_York', () => {
            // In America/New_York, DST springs forward at 02:00 -> 03:00 on 2026-03-08,
            // so 02:30 does not exist on 2026-03-08 and is normalized forward to 03:30 EDT (UTC-4):
            const source = momentWithFormat(window.moment('2026-03-07 02:30'), dateTimeFormat);
            const target = momentWithFormat(window.moment('2026-03-08'), dateFormat);

            const result = preserveTime(target, source);

            expect(result.isValid()).toBe(true);
            expect(hasTime(result)).toBe(true);
            expect(result.format(dateTimeFormat)).toBe('2026-03-08 03:30');
            expect(result.utcOffset()).toBe(-240);
        });
    });
});
