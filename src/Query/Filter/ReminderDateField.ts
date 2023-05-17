import type { Moment } from 'moment';
import type { Task } from '../../Task';
import type { Comparator } from '../Sorter';
import { compareByDate } from '../../lib/DateTools';
import { DateField } from './DateField';

/**
 * ReminderDateField provides filter, sorting and grouping of tasks by their reminder value.
 *
 * **Filtering** by reminder ignores times completely. Only the dates in the task reminders
 * and in the filter line are used. It is not possible to search for reminders at a particular
 * time of day.
 *
 * **Sorting** by reminder does use the reminder times, if supplied.
 */
export class ReminderDateField extends DateField {
    public fieldName(): string {
        return 'reminder';
    }

    /**
     * Return the reminder date **with any time stripped off**.
     *
     * In order for filtering by reminder to work correctly, this returns the reminder date
     * with any time stripped off, because the date-filtering works in whole days currently,
     * due to all the other date fields not supporting time.
     *
     * If you want the reminder date and time, use {@link dateWithTime}.
     * @param task
     * @see dateWithTime
     */
    public date(task: Task): Moment | null {
        if (task.reminder) {
            return task.reminder.time.startOf('day');
        } else {
            return null;
        }
    }

    /**
     * Return the reminder date including its time.
     *
     * If you want just the date, with time stripped off, use {@link date}.
     * @param task
     * @see date
     */
    public dateWithTime(task: Task): Moment | null {
        if (task.reminder) {
            return task.reminder.time;
        } else {
            return null;
        }
    }

    protected filterResultIfFieldMissing() {
        return false;
    }

    /**
     * Return a function to compare two Task objects by their reminder.
     *
     * @note This does use any time on reminders, for more precise sorting.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return compareByDate(this.dateWithTime(a), this.dateWithTime(b));
        };
    }
}
