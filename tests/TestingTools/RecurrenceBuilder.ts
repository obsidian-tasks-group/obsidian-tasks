// Builder
import type { Moment } from 'moment';
import { Recurrence } from '../../src/Recurrence';
import { DateParser } from '../../src/Query/DateParser';
import { Reminder, parseDateTime } from '../../src/Reminders/Reminder';

/**
 * A fluent class for creating Recurrence objects for tests.
 *
 * This uses the Builder Pattern.
 *
 * See RecurrenceBuilder.build() for an example of use.
 *
 * IMPORTANT: Changed values are retained after calls to .build()
 *            There is no way to reset a RecurrenceBuilder to its default
 *            start currently.
 *            Create a new RecurrenceBuilder object to start from a clean state,
 */
export class RecurrenceBuilder {
    private _recurrenceRuleText: string = 'every day';
    private _startDate: Moment | null = null;
    private _scheduledDate: Moment | null = null;
    private _dueDate: Moment | null = null;
    private _reminder: Reminder | null = null;

    /**
     * Build a Recurrence
     *
     * Example of use:
     *
     *  const builder = new RecurrenceBuilder();
     *  const recurrence = builder
     *      .rule('every week when done')
     *      .startDate('2022-07-14')
     *      .build();
     */
    public build(): Recurrence {
        return Recurrence.fromText({
            recurrenceRuleText: this._recurrenceRuleText,
            startDate: this._startDate,
            scheduledDate: this._scheduledDate,
            dueDate: this._dueDate,
            reminder: this._reminder,
        }) as Recurrence;
    }

    public rule(recurrenceRuleText: string): RecurrenceBuilder {
        this._recurrenceRuleText = recurrenceRuleText;
        return this;
    }

    public startDate(startDate: string | null): RecurrenceBuilder {
        this._startDate = RecurrenceBuilder.parseDate(startDate);
        return this;
    }

    public scheduledDate(scheduledDate: string | null): RecurrenceBuilder {
        this._scheduledDate = RecurrenceBuilder.parseDate(scheduledDate);
        return this;
    }

    public dueDate(dueDate: string | null): RecurrenceBuilder {
        this._dueDate = RecurrenceBuilder.parseDate(dueDate);
        return this;
    }

    public reminders(reminder: string): RecurrenceBuilder {
        if (reminder.length > 0) {
            this._reminder = parseDateTime(reminder);
        } else {
            this._reminder = null;
        }
        return this;
    }

    private static parseDate(date: string | null): Moment | null {
        if (date) {
            return DateParser.parseDate(date);
        } else {
            return null;
        }
    }
}
