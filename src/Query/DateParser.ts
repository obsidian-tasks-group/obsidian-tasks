import * as chrono from 'chrono-node';
import moment from 'moment';

export class DateParser {
    private static specificYearRegex = /[0-9]{4}/;
    private static specificQuarterRegex = /[0-9]{4}-Q[1-4]/;
    private static specificMonthRegex = /[0-9]{4}-[0-9]{2}/;
    private static specificWeekRegex = /[0-9]{4}-W[0-9]{2}/;
    private static specificYearFormat = 'YYYY';
    private static specificQuarterFormat = 'YYYY-Q';
    private static specificMonthFormat = 'YYYY-MM';
    private static specificWeekFormat = 'YYYY-WW';

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
        const relativeDateRange = DateParser.parseRelativeDateRange(input);
        if (relativeDateRange !== undefined) {
            return relativeDateRange;
        }

        // If relative date range was not parsed, fallback on absolute date range with chrono
        return DateParser.parseAbsoluteDateRange(input);
    }

    private static parseAbsoluteDateRange(input: string): [moment.Moment, moment.Moment] {
        const result = chrono.parse(input, undefined, {
            forwardDate: true,
        });

        if (result.length === 0) {
            // If chorono couldn't parse the date it could be a specific date range
            // Or a user error
            let specificDateRange: [moment.Moment, moment.Moment] = [moment.invalid(), moment.invalid()];

            const yearMatch = input.match(DateParser.specificYearRegex);
            if (yearMatch && yearMatch.length === 1 && yearMatch[0] === input) {
                specificDateRange = DateParser.buildSpecificDateRange(yearMatch[0], DateParser.specificYearFormat);
            }

            const quarterMatch = input.match(DateParser.specificQuarterRegex);
            if (quarterMatch && quarterMatch.length === 1 && quarterMatch[0] === input) {
                specificDateRange = DateParser.buildSpecificDateRange(
                    quarterMatch[0],
                    DateParser.specificQuarterFormat,
                );
            }

            const monthMatch = input.match(DateParser.specificMonthRegex);
            if (monthMatch && monthMatch.length === 1 && monthMatch[0] === input) {
                specificDateRange = DateParser.buildSpecificDateRange(monthMatch[0], DateParser.specificMonthFormat);
            }

            const weekMatch = input.match(DateParser.specificWeekRegex);
            if (weekMatch && weekMatch.length === 1 && weekMatch[0] === input) {
                specificDateRange = DateParser.buildSpecificDateRange(weekMatch[0], DateParser.specificWeekFormat);
            }

            return specificDateRange;
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

            // Dates shall be at midnight eg 00:00
            dateRange.forEach((d) => d.startOf('day'));

            return dateRange;
        }

        return undefined;
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

        return [moment(range, format).startOf(unit).startOf('day'), moment(range, format).endOf(unit).startOf('day')];
    }
}
