import type { Moment } from 'moment';
import { TaskRegularExpressions } from './Task';

/**
 * TaskDate encapsulates a date.
 */
export class TaskDate {
    public date: Moment | null = null;

    /**
     * Construct a TaskDate from a string.
     * @param date - a null, or a date, which must be in the format {@link TaskRegularExpressions.dateFormat}
     */
    public static fromString(date: string | null): TaskDate {
        const result = new TaskDate();
        if (date !== null) {
            result.date = window.moment(date, TaskRegularExpressions.dateFormat);
        }
        return result;
    }
}
