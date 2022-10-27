import type { Moment } from 'moment';
import { TaskRegularExpressions } from './Task';

/**
 * TaskDate encapsulates a date.
 */
export class TaskDate {
    public date: Moment | null = null;

    constructor(date: string | null = null) {
        if (date !== null) {
            this.date = window.moment(date, TaskRegularExpressions.dateFormat);
        }
    }

    public static fromMoment(dateAsMoment: moment.Moment | null): TaskDate {
        const date = new TaskDate();
        if (dateAsMoment !== null) {
            date.date = dateAsMoment;
        }
        return date;
    }

    public toString() {
        if (this.date) {
            return this.date.format(TaskRegularExpressions.dateFormat);
        } else {
            return '';
        }
    }
}
