import type { DurationInputArg2, Moment, unitOfTime } from 'moment';
import { Notice } from 'obsidian';
import { PropertyCategory } from '../lib/PropertyCategory';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';

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
     * Return the date formatted as YYYY-MM-DD, or {@link fallBackText} if there is no date.
     @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    public formatAsDate(fallBackText: string = ''): string {
        return this.format(TaskRegularExpressions.dateFormat, fallBackText);
    }

    /**
     * Return the date formatted as YYYY-MM-DD HH:mm, or {@link fallBackText} if there is no date.
     @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    public formatAsDateAndTime(fallBackText: string = ''): string {
        return this.format(TaskRegularExpressions.dateTimeFormat, fallBackText);
    }

    /**
     * Return the date formatted with the given format string, or {@link fallBackText} if there is no date.
     * See https://momentjs.com/docs/#/displaying/ for all the available formatting options.
     * @param format
     * @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    public format(format: string, fallBackText: string = ''): string {
        return this._date ? this._date.format(format) : fallBackText;
    }

    /**
     * Return the date as an ISO string, for example '2023-10-13T00:00:00.000Z'.
     * @param keepOffset
     * @returns - The date as an ISO string, for example: '2023-10-13T00:00:00.000Z',
     *            OR an empty string if no date, OR null for an invalid date.
     */
    public toISOString(keepOffset?: boolean): string | null {
        return this._date ? this._date.toISOString(keepOffset) : '';
    }

    public get category(): PropertyCategory {
        // begin-snippet: use-moment-in-src
        const today = window.moment();
        // end-snippet
        const date = this.moment;
        if (!date) {
            return new PropertyCategory('Undated', 4);
        }
        if (date.isBefore(today, 'day')) {
            return new PropertyCategory('Overdue', 1);
        }
        if (date.isSame(today, 'day')) {
            return new PropertyCategory('Today', 2);
        }
        if (!date.isValid()) {
            return new PropertyCategory('Invalid date', 0);
        }
        return new PropertyCategory('Future', 3);
    }

    public get fromNow(): PropertyCategory {
        const date = this.moment;
        if (!date) {
            return new PropertyCategory('', 0);
        }
        const order = this.fromNowOrder(date);
        return new PropertyCategory(date.fromNow(), order);
    }

    private fromNowOrder(date: moment.Moment) {
        // Always put invalid dates first:
        if (!date.isValid()) {
            return 0;
        }

        // Calculate a number that:
        //   - is the same for all dates with the same 'fromNow()' name,
        //   - sorts in ascending order of the date.

        const now = window.moment();
        const earlier = date.isSameOrBefore(now, 'day');
        const startDateOfThisGroup = this.fromNowStartDateOfGroup(date, earlier, now);
        const splitPastAndFutureDates = earlier ? 1 : 3;
        return Number(splitPastAndFutureDates + startDateOfThisGroup.format('YYYYMMDD'));
    }

    private fromNowStartDateOfGroup(date: moment.Moment, earlier: boolean, now: any) {
        // Calculate the earliest of all dates with the same 'fromNow()' name.

        // https://momentjs.com/docs/#/displaying/fromnow/
        // 'If you pass true, you can get the value without the suffix.'
        const words = date.fromNow(true).split(' ');

        let multiplier: number;
        const word0AsNumber = Number(words[0]);
        if (isNaN(word0AsNumber)) {
            multiplier = 1; // examples: 'a year', 'a month', 'a day'
        } else {
            multiplier = word0AsNumber; // examples: '10 years', '6 months', '11 hours'
        }
        const unit = words[1] as DurationInputArg2; // day, days, weeks, month, year
        return earlier ? now.subtract(multiplier, unit) : now.add(multiplier, unit);
    }

    public postpone(unitOfTime: unitOfTime.DurationConstructor = 'days', amount: number = 1) {
        if (!this._date) throw new Notice('Cannot postpone a null date');

        const today = window.moment().startOf('day');
        // According to the moment.js docs, isBefore is not stable so we use !isSameOrAfter: https://momentjs.com/docs/#/query/is-before/
        const isDateBeforeToday = !this._date.isSameOrAfter(today, 'day');

        if (isDateBeforeToday) {
            return today.add(amount, unitOfTime);
        }

        return this._date.clone().add(amount, unitOfTime);
    }
}
