import type { Moment } from 'moment';
import { TaskRegularExpressions } from '../Task';

/**
 * TasksDate encapsulates a date, for simplifying the JavaScript expressions users need to
 * write in 'group by function' lines.
 */
export class TasksDate {
    private readonly _date: Moment | null = null;

    public constructor(date: Moment | null) {
        this._date = date;
    }

    /**
     * Return the raw underlying moment (or null, if there is no date)
     */
    get moment(): Moment | null {
        return this._date;
    }

    /**
     * Return the date formatted as YYYY-MM-DD, or an empty string if there is no date.
     */
    public formatAsDate() {
        return this.format(TaskRegularExpressions.dateFormat);
    }

    /**
     * Return the date formatted as YYYY-MM-DD HH:mm, or an empty string if there is no date.
     */
    public formatAsDateAndTime() {
        return this.format(TaskRegularExpressions.dateTimeFormat);
    }

    /**
     * Return the date formatted with the given format string, or an empty string if there is no date.
     * See https://momentjs.com/docs/#/displaying/ for all the available formatting options.
     * @param format
     */
    public format(format: string) {
        return this._date ? this._date!.format(format) : '';
    }
}
