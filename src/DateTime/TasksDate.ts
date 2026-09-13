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
        return this._date ? this._date.clone() : null;
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
        const earlier = date.isSameOrBefore(now, 'second');
        const startDateOfThisGroup = this.fromNowStartDateOfGroup(date, earlier, now);
        const splitPastAndFutureDates = earlier ? 1 : 3;
        return Number(splitPastAndFutureDates + startDateOfThisGroup.format('YYYYMMDDHHmm'));
    }

    private fromNowStartDateOfGroup(date: moment.Moment, earlier: boolean, now: Moment): Moment {
        // Calculate the earliest of all dates with the same 'fromNow()' name.

        // https://momentjs.com/docs/#/displaying/fromnow/
        // 'If you pass true, you can get the value without the suffix.'
        // We change the locale to english, to get values like 'hours', 'days', 'years' that we can pass to Moment.
        const words = date.clone().locale('en').fromNow(true).split(' ');

        let multiplier: number;
        const word0AsNumber = Number(words[0]);
        if (isNaN(word0AsNumber)) {
            multiplier = 1; // examples: 'a year', 'a month', 'a day'
        } else {
            multiplier = word0AsNumber; // examples: '10 years', '6 months', '11 hours'
        }
        const unit = words[1] as moment.DurationInputArg2; // day, days, weeks, month, year
        return earlier ? now.subtract(multiplier, unit) : now.add(multiplier, unit);
    }

    public postpone(
        unitOfTime: moment.unitOfTime.DurationConstructor = 'days',
        amount: number = 1,
        skipWeekends: boolean = false,
    ) {
        if (!this._date) {
            const message = 'Cannot postpone a null date';
            new Notice(message);
            throw new Error(message);
        }

        const today = window.moment().startOf('day');
        // According to the moment.js docs, isBefore is not stable so we use !isSameOrAfter: https://momentjs.com/docs/#/query/is-before/
        const isDateBeforeToday = !this._date.isSameOrAfter(today, 'day');
        const base = isDateBeforeToday ? today : this._date.clone();

        // Only postpone-forward increments (amount > 0) are affected. The fixed "today" menu
        // item (amount === 0) means "set to today", so it must never be moved, even if today
        // itself happens to be a Saturday or Sunday.
        if (skipWeekends && amount > 0) {
            if (TasksDate.isDayUnit(unitOfTime)) {
                // For day-based increments, count only business days, so consecutive amounts
                // (1, 2, 3, ...) each land on their own following business day, instead of all
                // collapsing onto the same Monday once a weekend has been skipped over.
                return TasksDate.addBusinessDays(base, amount);
            }
            // Week/month increments keep their normal meaning; only the single final result
            // is rolled off a weekend, if it happens to land on one.
            return TasksDate.rollForwardOverWeekend(base.add(amount, unitOfTime));
        }

        return base.add(amount, unitOfTime);
    }

    /**
     * True if {@link unitOfTime} is a day-based increment ('day' or 'days'), as opposed to a
     * week- or month-based one. Used to decide whether skipping weekends should count business
     * days (for day-based increments) or just roll the single final result (for coarser ones).
     */
    public static isDayUnit(unitOfTime: moment.unitOfTime.DurationConstructor): boolean {
        return unitOfTime === 'day' || unitOfTime === 'days';
    }

    /**
     * Add {@link amount} business days (i.e. skipping Saturdays and Sundays) to {@link date}.
     */
    private static addBusinessDays(date: Moment, amount: number): Moment {
        const result = date.clone();
        let remainingBusinessDays = amount;
        while (remainingBusinessDays > 0) {
            result.add(1, 'day');
            if (result.day() !== 0 && result.day() !== 6) {
                remainingBusinessDays--;
            }
        }
        return result;
    }

    /**
     * If {@link date} falls on a Saturday or Sunday, move it forward to the following Monday.
     * Otherwise, return it unchanged.
     */
    private static rollForwardOverWeekend(date: Moment): Moment {
        const dayOfWeek = date.day(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 6) {
            return date.add(2, 'days');
        }
        if (dayOfWeek === 0) {
            return date.add(1, 'days');
        }
        return date;
    }
}
