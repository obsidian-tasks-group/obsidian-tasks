import * as chrono from 'chrono-node';

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

    public static parseDateRange(input: string) {
        const result = chrono.parse(input, undefined, {
            forwardDate: true,
        });

        const start = result[0].start;
        const end = result[0].end;
        return [window.moment(start.date()), window.moment(end!.date())];
    }
}
