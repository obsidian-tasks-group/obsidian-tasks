import { DateParser } from '../../src/DateTime/DateParser';

/**
 * Create a date string that is a certain number of days away from the given date.
 * This allows tests to be expressed in terms of numbers of days difference, rather
 * than having to construct two different date strings, with future maintainers
 * needing to work out what the difference was.
 * @param today - The starting date
 * @param daysInFuture - The number of days to add...
 *                       Positive numbers give future dates.
 *                       Negative numbers give past dayes.
 */
export function calculateRelativeDate(today: string, daysInFuture: number) {
    const todayAsDate = DateParser.parseDate(today);
    const relativeDate = todayAsDate.add(daysInFuture, 'd');
    return relativeDate.format('YYYY-MM-DD');
}

/**
 * Temporarily sets `process.env.TZ` to {@link tz} for the duration of synchronous callback {@link fn},
 * restoring the prevoius timezone (or deleting `process.env.TZ` if unset) afterwards.
 * Note: {@link fn} must be synchronous so `process.env.TZ` is not restored before async work finishes.
 */
export function withTimezone(tz: string, fn: () => void): void {
    const previousTZ = process.env.TZ;
    process.env.TZ = tz;
    try {
        fn();
    } finally {
        if (previousTZ === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = previousTZ;
        }
    }
}
