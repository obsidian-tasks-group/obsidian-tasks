import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateField } from './DateField';

/**
 * Support the 'due' search instruction.
 */
export class ReminderDateField extends DateField {
    public fieldName(): string {
        return 'reminder';
    }

    public date(task: Task): Moment | null {
        if (task && task.reminders.length > 0) {
            return task.reminders[0].getDate();
        } else {
            return null;
        }
    }

    protected filterResultIfFieldMissing() {
        return false;
    }
}
