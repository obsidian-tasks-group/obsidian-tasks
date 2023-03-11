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
        const result = chrono.parse(input, undefined, {
            forwardDate: true,
        });

        if (result.length === 0) {
            // If chorono couldn't parse the date it could be a specific date range
            // Or a user error
            let specificDateRange: [moment.Moment, moment.Moment] = [moment.invalid(), moment.invalid()];

            const yearRegex = /[0-9].../;
            const yearFormat = 'YYYY';
            const yearUnit = 'year';
            const yearMatch = input.match(yearRegex);
            if (yearMatch && yearMatch.length === 1 && yearMatch[0] === input) {
                specificDateRange = buildSpecificDateRange(yearMatch[0], yearFormat, yearUnit);
            }

            const quarterRegex = /[0-9]...-Q[1-4]/;
            const quarterFormat = 'YYYY-Q';
            const quarterUnit = 'quarter';
            const quarterMatch = input.match(quarterRegex);
            if (quarterMatch && quarterMatch.length === 1 && quarterMatch[0] === input) {
                specificDateRange = [
                    moment(quarterMatch[0], quarterFormat).startOf(quarterUnit).startOf('day'),
                    moment(quarterMatch[0], quarterFormat).endOf(quarterUnit).startOf('day'),
                ];
            }

            const monthRegex = /[0-9]...-[0-9]./;
            const monthFormat = 'YYYY-MM';
            const monthUnit = 'month';
            const monthMatch = input.match(monthRegex);
            if (monthMatch && monthMatch.length === 1 && monthMatch[0] === input) {
                specificDateRange = [
                    moment(monthMatch[0], monthFormat).startOf(monthUnit).startOf('day'),
                    moment(monthMatch[0], monthFormat).endOf(monthUnit).startOf('day'),
                ];
            }

            const weekRegex = /[0-9]...-W[0-9]./;
            const weekFormat = 'YYYY-WW';
            const weekUnit = 'isoWeek';
            const weekMatch = input.match(weekRegex);
            if (weekMatch && weekMatch.length === 1 && weekMatch[0] === input) {
                specificDateRange = [
                    moment(weekMatch[0], weekFormat).startOf(weekUnit).startOf('day'),
                    moment(weekMatch[0], weekFormat).endOf(weekUnit).startOf('day'),
                ];
            }

            return specificDateRange;
        }

        const startDate = result[0].start;
        const endDate = result[1] && result[1].start ? result[1].start : startDate;
        const start = window.moment(startDate.date());
        const end = window.moment(endDate.date());

        let dateRange: [moment.Moment, moment.Moment] = [start, end];
        if (end.isBefore(start)) {
            dateRange = [end, start];
        }

        const relativeDateRangeRegexp = /(last|this|next) (week|month|quarter|year)/;
        const relativeDateRangeMatch = input.match(relativeDateRangeRegexp);
        if (relativeDateRangeMatch && relativeDateRangeMatch.length === 3) {
            const lastThisNext = relativeDateRangeMatch[1];
            const delta = moment.duration();
            const range = relativeDateRangeMatch[2];
            switch (range) {
                case 'month':
                case 'quarter':
                case 'year':
                case 'week':
                    // This switch-case is only to avoid recasting String in unitOfTime.DurationConstructor accepted by Duration.add()
                    delta.add(1, range);
            }

            dateRange = [moment(), moment()];
            switch (lastThisNext) {
                case 'last':
                    dateRange.forEach((d) => d.subtract(delta));
                    break;
                case 'next':
                    dateRange.forEach((d) => d.add(delta));
                    break;
            }

            switch (range) {
                case 'month':
                case 'quarter':
                case 'year':
                    dateRange = [dateRange[0].startOf(range), dateRange[1].endOf(range)];
                    break;
                case 'week':
                    dateRange = [dateRange[0].startOf('isoWeek'), dateRange[1].endOf('isoWeek')];
                    break;
            }
        }

        // Dates shall be at midnight eg 00:00
        dateRange.forEach((d) => d.startOf('day'));
        return dateRange;

        function buildSpecificDateRange(
            yearMatch: string,
            yearFormat: string,
            yearUnit: moment.unitOfTime.Base,
        ): [moment.Moment, moment.Moment] {
            return [
                moment(yearMatch, yearFormat).startOf(yearUnit).startOf('day'),
                moment(yearMatch, yearFormat).endOf(yearUnit).startOf('day'),
            ];
        }
    }
}
