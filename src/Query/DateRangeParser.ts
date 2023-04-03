import moment from 'moment';

export class DateRangeParser {
    public parseRelativeDateRange(input: string): [moment.Moment, moment.Moment] | undefined {
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

            return dateRange;
        }

        return undefined;
    }
}
