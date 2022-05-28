import * as chrono from 'chrono-node';

export class DateParser {
    public static parseDate(input: string): moment.Moment {
        // Using start of day to correctly match on comparison with other dates (like equality).
        return window.moment(chrono.parseDate(input)).startOf('day');
    }
}
