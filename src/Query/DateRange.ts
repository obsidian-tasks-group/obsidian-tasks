export class DateRange {
    start: moment.Moment;
    end: moment.Moment;

    constructor(start: moment.Moment, end: moment.Moment) {
        this.start = start;
        this.end = end;
    }

    public wrap(): [moment.Moment, moment.Moment] {
        return [this.start, this.end];
    }
}
