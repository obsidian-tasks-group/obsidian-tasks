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
 * Temporarily sets `process.env.TZ` to {@link tz} while the callback {@link fn} runs,
 * and restores the previous timezone (or deletes `process.env.TZ` if it was unset) afterwards,
 * even if {@link fn} throws.
 *
 * {@link fn} must be synchronous, because the timezone is restored as soon as it returns.
 * TypeScript reports an error if an `async` function is passed.
 *
 * @example
 *      it('should format the same instant differently in New York', () => {
 *          withTimezone('America/New_York', () => {
 *              // 12:00 UTC is 07:00 in New York in winter:
 *              expect(window.moment('2026-01-15T12:00:00Z').format('HH:mm')).toBe('07:00');
 *          });
 *      });
 * @param tz - an IANA time zone name, such as 'America/New_York' or 'Pacific/Auckland'.
 *             See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for the full list.
 * @param fn - the synchronous callback to run with `process.env.TZ` set to {@link tz}
 */
export function withTimezone(tz: string, fn: () => void | undefined): void {
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
