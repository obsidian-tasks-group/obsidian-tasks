import * as chrono from 'chrono-node';
import moment from 'moment';

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
                return parsedDateRange;
            }
        }

        // If nothing worked return and invalid date range
        return [moment.invalid(), moment.invalid()];
    }

    private static parseAbsoluteDateRange(input: string): [moment.Moment, moment.Moment] | undefined {
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

        // Check momentjs parsing
        if (!start.isValid() || !end.isValid()) {
            return undefined;
        }

        let absoluteDateRange: [moment.Moment, moment.Moment] = [start, end];
        if (end.isBefore(start)) {
            absoluteDateRange = [end, start];
        }

        return DateParser.setDateRangeToStartOfDay(absoluteDateRange);
    }

    private static parseRelativeDateRange(input: string): [moment.Moment, moment.Moment] | undefined {
        const relativeDateRangeRegexp = /(last|this|next) (week|month|quarter|year)/;
        const relativeDateRangeMatch = input.match(relativeDateRangeRegexp);
        if (relativeDateRangeMatch && relativeDateRangeMatch.length === 3) {
            const lastThisNext = relativeDateRangeMatch[1];
            const range = relativeDateRangeMatch[2];

            const delta = moment.duration(1, range as moment.unitOfTime.DurationConstructor);

            let dateRange: [moment.Moment, moment.Moment] = [moment(), moment()];
            switch (lastThisNext) {
                case 'last':
                    dateRange.forEach((d) => d.subtract(delta));
                    break;
                case 'next':
                    dateRange.forEach((d) => d.add(delta));
                    break;
            }

            const unitOfTime = range === 'week' ? 'isoWeek' : (range as moment.unitOfTime.DurationConstructor);
            dateRange = [dateRange[0].startOf(unitOfTime), dateRange[1].endOf(unitOfTime)];

            return DateParser.setDateRangeToStartOfDay(dateRange);
        }

        return undefined;
    }

    private static specificYearRegex = /[0-9]{4}/;
    private static specificQuarterRegex = /[0-9]{4}-Q[1-4]/;
    private static specificMonthRegex = /[0-9]{4}-[0-9]{2}/;
    private static specificWeekRegex = /[0-9]{4}-W[0-9]{2}/;
    private static specificYearFormat = 'YYYY';
    private static specificQuarterFormat = 'YYYY-Q';
    private static specificMonthFormat = 'YYYY-MM';
    private static specificWeekFormat = 'YYYY-WW';

    private static parseSpecificDateRange(input: string): [moment.Moment, moment.Moment] | undefined {
        let parsedRange = undefined;

        const yearMatch = input.match(DateParser.specificYearRegex);
        if (yearMatch && yearMatch.length === 1 && yearMatch[0] === input) {
            parsedRange = DateParser.buildSpecificDateRange(yearMatch[0], DateParser.specificYearFormat);
        }

        const quarterMatch = input.match(DateParser.specificQuarterRegex);
        if (quarterMatch && quarterMatch.length === 1 && quarterMatch[0] === input) {
            parsedRange = DateParser.buildSpecificDateRange(quarterMatch[0], DateParser.specificQuarterFormat);
        }

        const monthMatch = input.match(DateParser.specificMonthRegex);
        if (monthMatch && monthMatch.length === 1 && monthMatch[0] === input) {
            parsedRange = DateParser.buildSpecificDateRange(monthMatch[0], DateParser.specificMonthFormat);
        }

        const weekMatch = input.match(DateParser.specificWeekRegex);
        if (weekMatch && weekMatch.length === 1 && weekMatch[0] === input) {
            parsedRange = DateParser.buildSpecificDateRange(weekMatch[0], DateParser.specificWeekFormat);
        }

        return parsedRange;
    }

    private static buildSpecificDateRange(range: string, format: string): [moment.Moment, moment.Moment] {
        let unit: moment.unitOfTime.Base | moment.unitOfTime._quarter | moment.unitOfTime._isoWeek = 'second';
        switch (format) {
            case DateParser.specificYearFormat:
                unit = 'year';
                break;
            case DateParser.specificQuarterFormat:
                unit = 'quarter';
                break;
            case DateParser.specificMonthFormat:
                unit = 'month';
                break;
            case DateParser.specificWeekFormat:
                unit = 'isoWeek';
                break;
        }

        const dateRange: [moment.Moment, moment.Moment] = [
            moment(range, format).startOf(unit),
            moment(range, format).endOf(unit),
        ];

        return DateParser.setDateRangeToStartOfDay(dateRange);
    }

    private static setDateRangeToStartOfDay(dateRange: [moment.Moment, moment.Moment]): [moment.Moment, moment.Moment] {
        // Dates shall be at midnight eg 00:00
        dateRange.forEach((d) => d.startOf('day'));
        return dateRange;
    }
}
