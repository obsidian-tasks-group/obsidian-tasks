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
}
