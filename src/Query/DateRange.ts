import moment from 'moment';

export class DateRange {
    start: moment.Moment;
    end: moment.Moment;

    constructor(start: moment.Moment, end: moment.Moment) {
        this.start = start;
        this.end = end;

        if (end.isBefore(start)) {
            this.start = end;
            this.end = start;
        }
        // Dates shall be at midnight eg 00:00
        this.start = this.start.startOf('day');
        this.end = this.end.startOf('day');
    }

    public subtract(duration: moment.unitOfTime.DurationConstructor) {
        const delta = moment.duration(1, duration);
        this.start.subtract(delta);
        this.end.subtract(delta);

        if (duration === 'month' || duration === 'quarter') {
            // Month and quarter durations in days may differ (28/30/31 days).
            // We will need to adjust the end.
            this.end = this.end.endOf(duration);
        }
    }

    public add(duration: moment.unitOfTime.DurationConstructor) {
        const delta = moment.duration(1, duration);
        this.start.add(delta);
        this.end.add(delta);

        if (duration === 'month' || duration === 'quarter') {
            // Month and quarter durations in days may differ (28/30/31 days).
            // We will need to adjust the end.
            this.end = this.end.endOf(duration);
        }
    }

    public static buildRelativeDateRange(range: moment.unitOfTime.StartOf) {
        // Treat all weeks as ISO 8601 weeks
        const unitOfTime = range === 'week' ? 'isoWeek' : range;

        return new DateRange(moment().startOf(unitOfTime).startOf('day'), moment().endOf(unitOfTime).startOf('day'));
    }

    public static buildInvalid(): DateRange {
        return new DateRange(moment.invalid(), moment.invalid());
    }

    public isValid(): boolean {
        return this.start.isValid() && this.end.isValid();
    }
}
