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

    public wrap(): [moment.Moment, moment.Moment] {
        return [this.start, this.end];
    }

    public subtract(duration: moment.unitOfTime.DurationConstructor) {
        const delta = moment.duration(1, duration);
        this.start.subtract(delta);
        this.end.subtract(delta);
    }

    public add(duration: moment.unitOfTime.DurationConstructor) {
        const delta = moment.duration(1, duration);
        this.start.add(delta);
        this.end.add(delta);
    }

    public expandTo(range: moment.unitOfTime.StartOf) {
        const unitOfTime = range === 'week' ? 'isoWeek' : range;
        this.start = this.start.startOf(unitOfTime).startOf('day');
        this.end = this.end.endOf(unitOfTime).startOf('day');
    }
}
