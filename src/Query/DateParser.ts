import * as chrono from 'chrono-node';
import type { Moment } from 'moment';
import { DateRange } from './DateRange';

export class DateParser {
    public static parseDate(input: string, forwardDate: boolean = false): Moment {
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
     * @param forwardDate - if true, and date is ambiguous, chrono will return dates in the future
     * @return - A Tuple of dates. If both input dates are invalid, then both output dates will be invalid.
     */
    public static parseDateRange(input: string, forwardDate: boolean = false): DateRange {
        const dateRangeParsers = [
            // Try parsing a relative date range like 'current month'
            DateParser.parseRelativeDateRange,
            // Try '2022-W10' otherwise
            DateParser.parseNumberedDateRange,
            // If previous failed, fallback on absolute date range with chrono
            DateParser.parseAbsoluteDateRange,
        ];

        for (const parser of dateRangeParsers) {
            const parsedDateRange = parser(input, forwardDate);
            if (parsedDateRange.isValid()) {
                return parsedDateRange;
            }
        }

        // If nothing worked return and invalid date range
        return DateRange.buildInvalid();
    }

    private static parseAbsoluteDateRange(input: string, forwardDate: boolean): DateRange {
        const result = chrono.parse(input, undefined, {
            forwardDate: forwardDate,
        });

        // Check chrono parsing
        if (result.length === 0) {
            return DateRange.buildInvalid();
        }

        const startDate = result[0].start;
        const endDate = result[1] && result[1].start ? result[1].start : startDate;
        const start = window.moment(startDate.date());
        const end = window.moment(endDate.date());

        return new DateRange(start, end);
    }

    private static parseRelativeDateRange(input: string, _forwardDate: boolean): DateRange {
        const relativeDateRangeRegexp = /(last|this|next) (week|month|quarter|year)/;
        const relativeDateRangeMatch = input.match(relativeDateRangeRegexp);
        if (relativeDateRangeMatch && relativeDateRangeMatch.length === 3) {
            const lastThisNext = relativeDateRangeMatch[1];
            const range = relativeDateRangeMatch[2];

            const dateRange = DateRange.buildRelative(range as moment.unitOfTime.StartOf);

            switch (lastThisNext) {
                case 'last':
                    dateRange.moveToPrevious(range as moment.unitOfTime.DurationConstructor);
                    break;
                case 'next':
                    dateRange.moveToNext(range as moment.unitOfTime.DurationConstructor);
                    break;
            }

            return dateRange;
        }

        return DateRange.buildInvalid();
    }

    private static parseNumberedDateRange(input: string, _forwardDate: boolean): DateRange {
        const parsingVectors: [RegExp, string, moment.unitOfTime.StartOf][] = [
            [/^\s*[0-9]{4}\s*$/, 'YYYY', 'year'],
            [/^\s*[0-9]{4}-Q[1-4]\s*$/, 'YYYY-Q', 'quarter'],
            [/^\s*[0-9]{4}-[0-9]{2}\s*$/, 'YYYY-MM', 'month'],
            [/^\s*[0-9]{4}-W[0-9]{2}\s*$/, 'YYYY-WW', 'isoWeek'],
        ];

        for (const [regexp, dateFormat, range] of parsingVectors) {
            const matched = input.match(regexp);
            if (matched) {
                // RegExps allow spaces (\s*), remove them before calling window.moment()
                const date = matched[0].trim();
                return new DateRange(
                    window.moment(date, dateFormat).startOf(range),
                    window.moment(date, dateFormat).endOf(range),
                );
            }
        }

        return DateRange.buildInvalid();
    }
}
