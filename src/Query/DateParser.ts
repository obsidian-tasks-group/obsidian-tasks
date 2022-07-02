import * as chrono from 'chrono-node';

export class DateParser {
    public static parseDate(
        input: string,
        forwardDate: boolean = false,
    ): moment.Moment {
        // Using start of day to correctly match on comparison with other dates (like equality).
        return window
            .moment(
                chrono.parseDate(input, undefined, {
                    forwardDate: forwardDate,
                }),
            )
            .startOf('day');
    }
}
