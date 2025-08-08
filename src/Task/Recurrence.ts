// begin-snippet: declare-Moment-type-in-src
import type { Moment } from 'moment';
// end-snippet
import { RRule } from 'rrule';
import type { Occurrence } from './Occurrence';

export class Recurrence {
    private readonly rrule: RRule;
    private readonly baseOnToday: boolean;
    readonly occurrence: Occurrence;

    constructor({ rrule, baseOnToday, occurrence }: { rrule: RRule; baseOnToday: boolean; occurrence: Occurrence }) {
        this.rrule = rrule;
        this.baseOnToday = baseOnToday;
        this.occurrence = occurrence;
    }

    public static fromText({
        recurrenceRuleText,
        occurrence,
    }: {
        recurrenceRuleText: string;
        occurrence: Occurrence;
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
                const referenceDate = occurrence.referenceDate;

                if (!baseOnToday && referenceDate !== null) {
                    options.dtstart = window.moment(referenceDate).startOf('day').utc(true).toDate();
                } else {
                    options.dtstart = window.moment().startOf('day').utc(true).toDate();
                }

                const rrule = new RRule(options);
                return new Recurrence({
                    rrule,
                    baseOnToday,
                    occurrence,
                });
            }
        } catch (e) {
            // Could not read recurrence rule. User possibly not done typing.
            // Print error message, as it is useful if a test file has not set up window.moment
            if (e instanceof Error) {
                console.log(e.message);
            }
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
     *
     * @param today - Optional date representing the completion date. Defaults to today.
     */
    public next(today = window.moment()): Occurrence | null {
        const nextReferenceDate = this.nextReferenceDate(today);

        if (nextReferenceDate === null) {
            return null;
        }

        return this.occurrence.next(nextReferenceDate);
    }

    public identicalTo(other: Recurrence) {
        if (this.baseOnToday !== other.baseOnToday) {
            return false;
        }

        if (!this.occurrence.isIdenticalTo(other.occurrence)) {
            return false;
        }

        return this.toText() === other.toText(); // this also checks baseOnToday
    }

    private nextReferenceDate(today: Moment): Date {
        if (this.baseOnToday) {
            // The next occurrence should happen based off the current date.
            return this.nextReferenceDateFromToday(today.clone()).toDate();
        } else {
            return this.nextReferenceDateFromOriginalReferenceDate().toDate();
        }
    }

    private nextReferenceDateFromToday(today: Moment): Moment {
        const ruleBasedOnToday = new RRule({
            ...this.rrule.origOptions,
            dtstart: today.startOf('day').utc(true).toDate(),
        });

        return this.nextAfter(today.endOf('day'), ruleBasedOnToday);
    }

    private nextReferenceDateFromOriginalReferenceDate(): Moment {
        // The next occurrence should happen based on the original reference
        // date if possible. Otherwise, base it on today if we do not have a
        // reference date.
        const after = window
            // Reference date can be `undefined` to mean "today".
            // Moment only accepts `undefined`, not `null`.
            .moment(this.occurrence.referenceDate ?? undefined)
            .endOf('day');

        return this.nextAfter(after, this.rrule);
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
    private nextAfter(after: Moment, rrule: RRule): Moment {
        // We need to remove the timezone, as rrule does not regard timezones and always
        // calculates in UTC.
        // The timezone is added again before returning the next date.
        after.utc(true);
        let next = window.moment.utc(rrule.after(after.toDate()));

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
        return Recurrence.addTimezone(next);
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
        let parsedSkippingMonths: number = 1;
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
    private static isSkippingTooManyMonths(after: Moment, next: Moment, skippingMonths: number): boolean {
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
        let parsedSkippingYears: number = 1;
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
    private static isSkippingTooManyYears(after: Moment, next: Moment, skippingYears: number): boolean {
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

        return window.moment.utc(rrule.after(after.toDate()));
    }

    private static addTimezone(date: Moment): Moment {
        // Moment's local(true) method has a bug where it returns incorrect result if the input is of
        // the day of the year when DST kicks in and the time of day is before DST actually kicks in
        // (typically between midnight and very early morning, varying across geographies).
        // We workaround the bug by setting the time of day to noon before calling local(true)
        const localTimeZone = window.moment
            .utc(date)
            .set({
                hour: 12,
                minute: 0,
                second: 0,
                millisecond: 0,
            })
            .local(true);

        return localTimeZone.startOf('day');
    }
}
