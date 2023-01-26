import type { Moment } from 'moment';
import { RRule } from 'rrule';
import { compareByDate } from './lib/DateTools';

export class Recurrence {
    private readonly rrule: RRule;
    private readonly baseOnToday: boolean;
    private readonly startDate: Moment | null;
    private readonly scheduledDate: Moment | null;
    private readonly dueDate: Moment | null;

    /**
     * The reference date is used to calculate future occurrences.
     *
     * Future occurrences will recur based on the reference date.
     * The reference date is the due date, if it is given.
     * Otherwise the scheduled date, if it is given. And so on.
     *
     * Recurrence of all dates will be kept relative to the reference date.
     * For example: if the due date and the start date are given, the due date
     * is the reference date. Future occurrences will have a start date with the
     * same relative distance to the due date as the original task. For example
     * "starts one week before it is due".
     */
    private readonly referenceDate: Moment | null;

    constructor({
        rrule,
        baseOnToday,
        referenceDate,
        startDate,
        scheduledDate,
        dueDate,
    }: {
        rrule: RRule;
        baseOnToday: boolean;
        referenceDate: Moment | null;
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    }) {
        this.rrule = rrule;
        this.baseOnToday = baseOnToday;
        this.referenceDate = referenceDate;
        this.startDate = startDate;
        this.scheduledDate = scheduledDate;
        this.dueDate = dueDate;
    }

    public static fromText({
        recurrenceRuleText,
        startDate,
        scheduledDate,
        dueDate,
    }: {
        recurrenceRuleText: string;
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    }): Recurrence | null {
        try {
            const match = recurrenceRuleText.match(/^([a-zA-Z0-9, !]+?)( when done)?$/i);
            if (match == null) {
                return null;
            }

            const isolatedRuleText = match[1].trim();
            const baseOnToday = match[2] !== undefined;

            const options = RRule.parseText(isolatedRuleText);
            if (options !== null) {
                // Pick the reference date for recurrence based on importance.
                // Assuming due date has the highest priority.
                let referenceDate: Moment | null = null;
                // Clone the moment objects.
                if (dueDate) {
                    referenceDate = window.moment(dueDate);
                } else if (scheduledDate) {
                    referenceDate = window.moment(scheduledDate);
                } else if (startDate) {
                    referenceDate = window.moment(startDate);
                }

                if (!baseOnToday && referenceDate !== null) {
                    options.dtstart = window.moment(referenceDate).startOf('day').utc(true).toDate();
                } else {
                    options.dtstart = window.moment().startOf('day').utc(true).toDate();
                }

                const rrule = new RRule(options);
                return new Recurrence({
                    rrule,
                    baseOnToday,
                    referenceDate,
                    startDate,
                    scheduledDate,
                    dueDate,
                });
            }
        } catch (error) {
            // Could not read recurrence rule. User possibly not done typing.
        }

        return null;
    }

    public toText(): string {
        let text = this.rrule.toText();
        if (this.baseOnToday) {
            text += ' when done';
        }

        return text;
    }

    /**
     * Returns the dates of the next occurrence or null if there is no next occurrence.
     */
    public next(): {
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    } | null {
        let next: Date;
        if (this.baseOnToday) {
            // The next occurrence should happen based off the current date.
            const today = window.moment();
            const ruleBasedOnToday = new RRule({
                ...this.rrule.origOptions,
                dtstart: today.startOf('day').utc(true).toDate(),
            });
            next = this.nextAfter(today.endOf('day'), ruleBasedOnToday);
        } else {
            // The next occurrence should happen based on the original reference
            // date if possible. Otherwise, base it on today if we do not have a
            // reference date.
            const after = window
                // Reference date can be `undefined` to mean "today".
                // Moment only accepts `undefined`, not `null`.
                .moment(this.referenceDate ?? undefined)
                .endOf('day');

            next = this.nextAfter(after, this.rrule);
        }

        if (next !== null) {
            // Keep the relative difference between the reference date and
            // start/scheduled/due.
            let startDate: Moment | null = null;
            let scheduledDate: Moment | null = null;
            let dueDate: Moment | null = null;

            // Only if a reference date is given. A reference date will exist if at
            // least one of the other dates is set.
            if (this.referenceDate) {
                if (this.startDate) {
                    const originalDifference = window.moment.duration(this.startDate.diff(this.referenceDate));

                    // Cloning so that original won't be manipulated:
                    startDate = window.moment(next);
                    // Rounding days to handle cross daylight-savings-time recurrences.
                    startDate.add(Math.round(originalDifference.asDays()), 'days');
                }
                if (this.scheduledDate) {
                    const originalDifference = window.moment.duration(this.scheduledDate.diff(this.referenceDate));

                    // Cloning so that original won't be manipulated:
                    scheduledDate = window.moment(next);
                    // Rounding days to handle cross daylight-savings-time recurrences.
                    scheduledDate.add(Math.round(originalDifference.asDays()), 'days');
                }
                if (this.dueDate) {
                    const originalDifference = window.moment.duration(this.dueDate.diff(this.referenceDate));

                    // Cloning so that original won't be manipulated:
                    dueDate = window.moment(next);
                    // Rounding days to handle cross daylight-savings-time recurrences.
                    dueDate.add(Math.round(originalDifference.asDays()), 'days');
                }
            }

            return {
                startDate,
                scheduledDate,
                dueDate,
            };
        }

        return null;
    }

    public identicalTo(other: Recurrence) {
        if (this.baseOnToday !== other.baseOnToday) {
            return false;
        }

        // Compare Date fields
        if (compareByDate(this.startDate, other.startDate) !== 0) {
            return false;
        }
        if (compareByDate(this.scheduledDate, other.scheduledDate) !== 0) {
            return false;
        }
        if (compareByDate(this.dueDate, other.dueDate) !== 0) {
            return false;
        }

        return this.toText() === other.toText(); // this also checks baseOnToday
    }

    /**
     * nextAfter returns the next occurrence's date after `after`, based on the given rrule.
     *
     * The common case is that `rrule.after` calculates the next date and it
     * can be used as is.
     *
     * In the special cases of monthly and yearly recurrences, there exists an
     * edge case where an occurrence after the given number of months or years
     * is not possible. For example: A task is due on 2022-01-31 and has a
     * recurrence of `every month`. When marking the task as done, the next
     * occurrence will happen on 2022-03-31. The reason being that February
     * does not have 31 days, yet RRule sets `bymonthday` to `31` for lack of
     * having a better alternative.
     *
     * In order to fix this, `after` will move into the past day by day. Each
     * day, the next occurrence is checked to be after the given number of
     * months or years. By moving `after` into the past day by day, it will
     * eventually calculate the next occurrence based on `2022-01-28`, ending up
     * in February as the user would expect.
     */
    private nextAfter(after: Moment, rrule: RRule): Date {
        // We need to remove the timezone, as rrule does not regard timezones and always
        // calculates in UTC.
        // The timezone is added again before returning the next date.
        after.utc(true);
        let next = window.moment(rrule.after(after.toDate()));

        // If this is a monthly recurrence, treat it special.
        const asText = this.toText();
        const monthMatch = asText.match(/every( \d+)? month(s)?(.*)?/);
        if (monthMatch !== null) {
            // ... unless the rule fixes the date, such as 'every month on the 31st'
            if (!asText.includes(' on ')) {
                next = Recurrence.nextAfterMonths(after, next, rrule, monthMatch[1]);
            }
        }

        // If this is a yearly recurrence, treat it special.
        const yearMatch = asText.match(/every( \d+)? year(s)?(.*)?/);
        if (yearMatch !== null) {
            next = Recurrence.nextAfterYears(after, next, rrule, yearMatch[1]);
        }

        // Here we add the timezone again that we removed in the beginning of this method.
        return Recurrence.addTimezone(next).toDate();
    }

    /**
     * nextAfterMonths calculates the next date after `skippingMonths` months.
     *
     * `skippingMonths` defaults to `1` if undefined.
     */
    private static nextAfterMonths(
        after: Moment,
        next: Moment,
        rrule: RRule,
        skippingMonths: string | undefined,
    ): Moment {
        // Parse `skippingMonths`, if it exists.
        let parsedSkippingMonths: Number = 1;
        if (skippingMonths !== undefined) {
            parsedSkippingMonths = Number.parseInt(skippingMonths.trim(), 10);
        }

        // While we skip the wrong number of months, move `after` one day into the past.
        while (Recurrence.isSkippingTooManyMonths(after, next, parsedSkippingMonths)) {
            // The next line alters `after` to be one day earlier.
            // Then returns `next` based on that.
            next = Recurrence.fromOneDayEarlier(after, rrule);
        }

        return next;
    }

    /**
     * isSkippingTooManyMonths returns true if `next` is more than `skippingMonths` months after `after`.
     */
    private static isSkippingTooManyMonths(after: Moment, next: Moment, skippingMonths: Number): boolean {
        let diffMonths = next.month() - after.month();

        // Maybe some years have passed?
        const diffYears = next.year() - after.year();
        diffMonths += diffYears * 12;

        return diffMonths > skippingMonths;
    }

    /**
     * nextAfterYears calculates the next date after `skippingYears` years.
     *
     * `skippingYears` defaults to `1` if undefined.
     */
    private static nextAfterYears(
        after: Moment,
        next: Moment,
        rrule: RRule,
        skippingYears: string | undefined,
    ): Moment {
        // Parse `skippingYears`, if it exists.
        let parsedSkippingYears: Number = 1;
        if (skippingYears !== undefined) {
            parsedSkippingYears = Number.parseInt(skippingYears.trim(), 10);
        }

        // While we skip the wrong number of years, move `after` one day into the past.
        while (Recurrence.isSkippingTooManyYears(after, next, parsedSkippingYears)) {
            // The next line alters `after` to be one day earlier.
            // Then returns `next` based on that.
            next = Recurrence.fromOneDayEarlier(after, rrule);
        }

        return next;
    }

    /**
     * isSkippingTooManyYears returns true if `next` is more than `skippingYears` years after `after`.
     */
    private static isSkippingTooManyYears(after: Moment, next: Moment, skippingYears: Number): boolean {
        const diff = next.year() - after.year();

        return diff > skippingYears;
    }

    /**
     * fromOneDayEarlier returns the next occurrence after moving `after` one day into the past.
     *
     * WARNING: This method manipulates the given instance of `after`.
     */
    private static fromOneDayEarlier(after: Moment, rrule: RRule): Moment {
        after.subtract(1, 'days').endOf('day');

        const options = rrule.origOptions;
        options.dtstart = after.startOf('day').toDate();
        rrule = new RRule(options);

        return window.moment(rrule.after(after.toDate()));
    }

    private static addTimezone(date: Moment): Moment {
        const localTimeZone = window.moment.utc(date).local(true);

        return localTimeZone.startOf('day');
    }
}
