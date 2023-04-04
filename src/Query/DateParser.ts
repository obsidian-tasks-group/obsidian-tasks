import * as chrono from 'chrono-node';
import moment from 'moment';
import { DateRange } from './DateRange';

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
        const dateRangeParsers = [
            // Try parsing a relative date range like 'current month'
            DateParser.parseRelativeDateRange,
            // Try '2022-W10' otherwise
            DateParser.parseSpecificDateRange,
            // If previous failed, fallback on absolute date range with chrono
            DateParser.parseAbsoluteDateRange,
        ];

        for (const parser of dateRangeParsers) {
            const parsedDateRange = parser(input);
            if (parsedDateRange !== undefined) {
                return parsedDateRange.wrap();
            }
        }

        // If nothing worked return and invalid date range
        return [moment.invalid(), moment.invalid()];
    }

    private static parseAbsoluteDateRange(input: string): DateRange | undefined {
        const result = chrono.parse(input, undefined, {
            forwardDate: true,
        });

        // Check chrono parsing
        if (result.length === 0) {
            return undefined;
        }

        const startDate = result[0].start;
        const endDate = result[1] && result[1].start ? result[1].start : startDate;
        const start = window.moment(startDate.date());
        const end = window.moment(endDate.date());

        return new DateRange(start, end);
    }

    private static parseRelativeDateRange(input: string): DateRange | undefined {
        const relativeDateRangeRegexp = /(last|this|next) (week|month|quarter|year)/;
        const relativeDateRangeMatch = input.match(relativeDateRangeRegexp);
        if (relativeDateRangeMatch && relativeDateRangeMatch.length === 3) {
            const lastThisNext = relativeDateRangeMatch[1];
            const range = relativeDateRangeMatch[2];

            const delta = moment.duration(1, range as moment.unitOfTime.DurationConstructor);

            const dateRange: [moment.Moment, moment.Moment] = [moment(), moment()];
            switch (lastThisNext) {
                case 'last':
                    dateRange.forEach((d) => d.subtract(delta));
                    break;
                case 'next':
                    dateRange.forEach((d) => d.add(delta));
                    break;
            }

            const unitOfTime = range === 'week' ? 'isoWeek' : (range as moment.unitOfTime.DurationConstructor);

            return new DateRange(dateRange[0].startOf(unitOfTime), dateRange[1].endOf(unitOfTime));
        }

        return undefined;
    }

    private static parseSpecificDateRange(input: string): DateRange | undefined {
        const parsingVectors: [RegExp, string, moment.unitOfTime.StartOf][] = [
            [/^\s*[0-9]{4}\s*$/, 'YYYY', 'year'],
            [/^\s*[0-9]{4}-Q[1-4]\s*$/, 'YYYY-Q', 'quarter'],
            [/^\s*[0-9]{4}-[0-9]{2}\s*$/, 'YYYY-MM', 'month'],
            [/^\s*[0-9]{4}-W[0-9]{2}\s*$/, 'YYYY-WW', 'isoWeek'],
        ];

        for (const [regexp, format, unit] of parsingVectors) {
            const matched = input.match(regexp);
            if (matched) {
                // RegExps allow spaces (\s*), remove them before calling moment()
                const range = matched[0].trim();
                return new DateRange(moment(range, format).startOf(unit), moment(range, format).endOf(unit));
            }
        }

        return undefined;
    }
}
