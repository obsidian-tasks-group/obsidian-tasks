import type { DurationInputArg2, Moment } from 'moment';
import { TaskRegularExpressions } from '../Task';

// TODO Rename to PropertyCategory?
// TODO Move to separate file
// TODO Add tests
// TODO Add JSdoc
class Category {
    public readonly name: string;
    public readonly sortOrder: number;

    // Pass in an empty name if you want groupText to be ''
    constructor(name: string, number: number) {
        this.name = name;
        this.sortOrder = number;
    }

    public get groupText(): string {
        if (this.name !== '') {
            return `%%${this.sortOrder}%% ${this.name}`;
        } else {
            return '';
        }
    }
}

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
        return this._date ? this._date!.format(format) : fallBackText;
    }

    /**
     * Return the date as an ISO string, for example '2023-10-13T00:00:00.000Z'.
     * @param keepOffset
     * @returns - The date as an ISO string, for example: '2023-10-13T00:00:00.000Z',
     *            OR an empty string if no date, OR null for an invalid date.
     */
    public toISOString(keepOffset?: boolean): string | null {
        return this._date ? this._date!.toISOString(keepOffset) : '';
    }

    public get category(): Category {
        const today = window.moment();
        const date = this.moment;
        if (!date) {
            return new Category('Undated', 4);
        }
        if (date.isBefore(today, 'day')) {
            return new Category('Overdue', 1);
        }
        if (date.isSame(today, 'day')) {
            return new Category('Today', 2);
        }
        return new Category('Future', 3);
    }

    public get fromNow(): Category {
        const date = this.moment;
        if (!date) {
            return new Category('', 0);
        }
        const order = this.fromNowOrder(date);
        return new Category(date.fromNow(), order);
    }

    private fromNowOrder(date: moment.Moment) {
        const now = window.moment();
        const earlier = date.isSameOrBefore(now, 'day');
        const startDateOfThisGroup = this.fromNowStartDateOfGroup(date, earlier, now);
        const splitPastAndFutureDates = earlier ? 1 : 3;
        return Number(splitPastAndFutureDates + startDateOfThisGroup.format('YYYYMMDD'));
    }

    private fromNowStartDateOfGroup(date: moment.Moment, earlier: boolean, now: any) {
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
}
