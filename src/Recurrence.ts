import type { Moment } from 'moment';
import { RRule } from 'rrule';
import { Sort } from './Query/Sort';

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
                // Reference date can be `null` to mean "today".
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
        if (Sort.compareByDate(this.startDate, other.startDate) !== 0) {
            return false;
        }
        if (Sort.compareByDate(this.scheduledDate, other.scheduledDate) !== 0) {
            return false;
        }
        if (Sort.compareByDate(this.dueDate, other.dueDate) !== 0) {
            return false;
        }

        return this.toText() === other.toText(); // this also checks baseOnToday
    }

    private nextAfter(after: Moment, rrule: RRule): Date {
        after.utc(true);
        let next = window.moment(rrule.after(after.toDate()));

        const monthMatch = this.toText().match(/every( \d+)? month(s)?(.*)?/);
        if (monthMatch !== null) {
            next = Recurrence.nextAfterMonths(after, next, rrule, monthMatch[1]);
        }

        const yearMatch = this.toText().match(/every( \d+)? year(s)?(.*)?/);
        if (yearMatch !== null) {
            next = Recurrence.nextAfterYears(after, next, rrule, yearMatch[1]);
        }

        return Recurrence.addTimezone(next).toDate();
    }

    private static nextAfterMonths(
        after: Moment,
        next: Moment,
        rrule: RRule,
        skippingMonths: string | undefined,
    ): Moment {
        let parsedSkippingMonths: Number = 1;
        if (skippingMonths !== undefined) {
            parsedSkippingMonths = Number.parseInt(skippingMonths.trim(), 10);
        }

        while (Recurrence.isSkippingTooManyMonths(after, next, parsedSkippingMonths)) {
            next = Recurrence.fromOneDayEarlier(after, rrule);
        }

        return next;
    }

    private static isSkippingTooManyMonths(after: Moment, next: Moment, skippingMonths: Number): boolean {
        let diff = next.month() - after.month();
        if (diff < 0) {
            diff = diff + 12;
        }

        return diff > skippingMonths;
    }

    private static nextAfterYears(
        after: Moment,
        next: Moment,
        rrule: RRule,
        skippingYears: string | undefined,
    ): Moment {
        let parsedSkippingYears: Number = 1;
        if (skippingYears !== undefined) {
            parsedSkippingYears = Number.parseInt(skippingYears.trim(), 10);
        }
        while (Recurrence.isSkippingTooManyYears(after, next, parsedSkippingYears)) {
            next = Recurrence.fromOneDayEarlier(after, rrule);
        }

        return next;
    }

    private static isSkippingTooManyYears(after: Moment, next: Moment, skippingYears: Number): boolean {
        const diff = next.year() - after.year();

        return diff > skippingYears;
    }

    private static fromOneDayEarlier(after: Moment, rrule: RRule): Moment {
        after.subtract(1, 'days').endOf('day');

        const options = rrule.origOptions;
        options.dtstart = after.startOf('day').toDate();
        rrule = new RRule(options);

        const next = window.moment(rrule.after(after.toDate()));

        return next;
    }

    private static addTimezone(date: Moment): Moment {
        const localTimeZone = window.moment.utc(date).local(true);

        return localTimeZone.startOf('day');
    }
}
