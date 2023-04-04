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

    public wrap(): [moment.Moment, moment.Moment] {
        return [this.start, this.end];
    }
}
