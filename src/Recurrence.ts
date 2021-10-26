import type { Moment } from 'moment';
import { RRule } from 'rrule';

export class Recurrence {
    private readonly rrule: RRule;
    private readonly dueDate: Moment | null;

    constructor({ rrule, dueDate }: { rrule: RRule; dueDate: Moment | null }) {
        this.rrule = rrule;
        this.dueDate = dueDate;
    }

    public static fromText({
        recurrenceRuleText,
        dueDate,
    }: {
        recurrenceRuleText: string;
        dueDate: Moment | null;
    }): Recurrence | null {
        try {
            const options = RRule.parseText(recurrenceRuleText);
            if (options !== null) {
                if (dueDate) {
                    options.dtstart = dueDate.startOf('day').utc(true).toDate();
                }
                const rrule = new RRule(options);
                return new Recurrence({ rrule, dueDate });
            }
        } catch (error) {
            // Could not read recurrence rule. User possibly not done typing.
        }

        return null;
    }

    public toText(): string {
        return this.rrule.toText();
    }

    public next(): Moment | null {
        let nextOccurrence: Moment | null = null;

        let after: Moment;
        if (this.dueDate !== null) {
            after = this.dueDate.endOf('day').utc(true);
        } else {
            after = window.moment().endOf('day').utc(true);
        }

        // The next occurrence should happen based on the original due date.
        const next = this.rrule.after(after.toDate());

        if (next !== null) {
            // Re-add the timezone that RRule disregarded:
            const localTimeZone = window.moment(next).utc().local(true);
            nextOccurrence = localTimeZone.startOf('day');
        }

        return nextOccurrence;
    }
}
