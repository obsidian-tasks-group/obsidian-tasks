import * as chrono from 'chrono-node';
import moment from 'moment';
import { DateRangeParser } from './DateRangeParser';

export class DateParser {
    public static parseDate(input: string, forwardDate: boolean = false): moment.Moment {
        // Using start of day to correctly match on comparison with other dates (like equality).
        return window
            .moment(
                chrono.parseDate(input, undefined, {
                    forwardDate: forwardDate,
                }),
            )
            .startOf('day');
    }

    /**
     * Parse a line and extract a pair of dates, returned in a tuple, sorted by date.
     * @param input - any pair of dates, separate by one or more spaces '17 August 2013 19 August 2013',
     *                or a single date.
     * @return - A Tuple of dates. If both input dates are invalid, then both ouput dates will be invalid.
     */
    public static parseDateRange(input: string): [moment.Moment, moment.Moment] {
        const parser = new DateRangeParser();
        const relativeDateRange = parser.parseRelativeDateRange(input);
        if (relativeDateRange !== undefined) {
            // Dates shall be at midnight eg 00:00
            relativeDateRange.forEach((d) => d.startOf('day'));
            return relativeDateRange;
        }

        // If relative date range was not parsed, fallback on absolute date range with chrono
        const result = chrono.parse(input, undefined, {
            forwardDate: true,
        });

        if (result.length === 0) {
            return [moment.invalid(), moment.invalid()];
        }

        const startDate = result[0].start;
        const endDate = result[1] && result[1].start ? result[1].start : startDate;
        const start = window.moment(startDate.date());
        const end = window.moment(endDate.date());

        let absoluteDateRange: [moment.Moment, moment.Moment] = [start, end];
        if (end.isBefore(start)) {
            absoluteDateRange = [end, start];
        }

        // Dates shall be at midnight eg 00:00
        absoluteDateRange.forEach((d) => d.startOf('day'));
        return absoluteDateRange;
    }
}
