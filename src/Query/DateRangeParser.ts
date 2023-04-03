import moment from 'moment';

export class DateRangeParser {
    public parseRelativeDateRange(input: string, dateRange: [moment.Moment, moment.Moment]) {
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
        return dateRange;
    }
}