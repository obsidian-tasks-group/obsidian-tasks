export class DateRange {
    start: moment.Moment;
    end: moment.Moment;

    constructor(start: moment.Moment, end: moment.Moment) {
        this.start = start.startOf('day');
        this.end = end.startOf('day');
    }

    public wrap(): [moment.Moment, moment.Moment] {
        return [this.start, this.end];
    }
}
