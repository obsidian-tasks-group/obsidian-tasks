import { DateParser } from '../../src/Query/DateParser';

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
