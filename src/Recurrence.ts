import type { Moment } from 'moment';
import { RRule } from 'rrule';

import { getSettings } from './Settings';

export class Recurrence {
    private readonly rrule: RRule;
    private readonly strict: boolean;
    private readonly startDate: Moment | null;
    private readonly scheduledDate: Moment | null;
    private readonly dueDate: Moment | null;

    /**
     * The reference date is used to calculate future occurences.
     *
     * Future occurences will recur based on the reference date.
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

    private static readonly strictRecurrencePrefix = 'strictly ';

    constructor({
        rrule,
        strict,
        referenceDate,
        startDate,
        scheduledDate,
        dueDate,
    }: {
        rrule: RRule;
        strict: boolean;
        referenceDate: Moment | null;
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    }) {
        this.rrule = rrule;
        this.strict = strict;
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
        const { enforceStrictRecurrence } = getSettings();

        try {
            const [strict, ruleText] = enforceStrictRecurrence
                ? [true, recurrenceRuleText]
                : [
                      recurrenceRuleText.startsWith(
                          this.strictRecurrencePrefix,
                      ),
                      recurrenceRuleText
                          .replace(this.strictRecurrencePrefix, '')
                          .trim(),
                  ];

            const options = RRule.parseText(ruleText);
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

                if (referenceDate !== null) {
                    options.dtstart = window
                        .moment(referenceDate)
                        .startOf('day')
                        .utc(true)
                        .toDate();
                }

                const rrule = new RRule(options);
                return new Recurrence({
                    rrule,
                    strict,
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
        const { enforceStrictRecurrence } = getSettings();

        const ruleText = this.rrule.toText();
        return this.strict && !enforceStrictRecurrence
            ? Recurrence.strictRecurrencePrefix + ruleText
            : ruleText;
    }

    /**
     * Returns the dates of the next occurrence or null if there is no next occurrence.
     */
    public next(): {
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    } | null {
        // The next occurrence should happen based on the original reference
        // date if possible. Otherwise, base it on today.
        let after: Moment;
        if (this.referenceDate !== null) {
            // Clone to not alter the original reference date.
            after = window.moment(this.referenceDate);
        } else {
            after = window.moment();
        }

        after.endOf('day');
        after.utc(true);

        const next = this.rrule.after(after.toDate());

        if (next !== null) {
            // Re-add the timezone that RRule disregarded:
            const localTimeZone = window.moment.utc(next).local(true);
            const nextOccurrence = localTimeZone.startOf('day');

            // Keep the relative difference between the reference date and
            // start/scheduled/due.
            let startDate: Moment | null = null;
            let scheduledDate: Moment | null = null;
            let dueDate: Moment | null = null;

            // handler to compute future dates offset by original difference and over "due" difference
            const computeNextDate = (date: Moment): Moment => {
                const originalDifference = window.moment.duration(
                    date.diff(this.referenceDate),
                );

                // Cloning so that original won't be manipulated:
                const nextCopy = window.moment(nextOccurrence);
                // Rounding days to handle cross daylight-savings-time recurrences.
                nextCopy.add(Math.round(originalDifference.asDays()), 'days');

                // if strict, then done day is not relevant
                if (this.strict) {
                    return nextCopy;
                }

                // calculate days over "due"
                const today = window.moment().startOf('day').utc(true);
                const doneDifference = window.moment.duration(
                    today.diff(this.referenceDate),
                );

                // Rounding days to handle cross daylight-savings-time recurrences.
                nextCopy.add(Math.round(doneDifference.asDays()), 'days');

                return nextCopy;
            };

            // Only if a reference date is given. A reference date will exist if at
            // least one of the other dates is set.
            if (this.referenceDate) {
                if (this.startDate) {
                    startDate = computeNextDate(this.startDate);
                }
                if (this.scheduledDate) {
                    scheduledDate = computeNextDate(this.scheduledDate);
                }
                if (this.dueDate) {
                    dueDate = computeNextDate(this.dueDate);
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
}
