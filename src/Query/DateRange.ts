export class DateRange {
    start: moment.Moment;
    end: moment.Moment;

    constructor(start: moment.Moment, end: moment.Moment) {
        // Dates shall be at midnight eg 00:00
        this.start = start.startOf('day');
        this.end = end.startOf('day');
    }

    public wrap(): [moment.Moment, moment.Moment] {
        return [this.start, this.end];
    }
}
