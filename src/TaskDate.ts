import type { Moment } from 'moment';
import { TaskRegularExpressions } from './Task';

/**
 * TaskDate encapsulates a date.
 */
export class TaskDate {
    public date: Moment | null = null;

    /**
     * Construct a TaskDate from a string.
     * @param date - a date, which must be in the format {@link TaskRegularExpressions.dateFormat}
     */
    public static fromString(date: string): TaskDate {
        const result = new TaskDate();
        result.date = window.moment(date, TaskRegularExpressions.dateFormat);
        return result;
    }
}
