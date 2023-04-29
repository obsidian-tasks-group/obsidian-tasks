import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateField } from './DateField';

export class ReminderDateField extends DateField {
    public fieldName(): string {
        return 'reminder';
    }

    public date(task: Task): Moment | null {
        if (task.reminders && task.reminders.times.length > 0) {
            return task.reminders.times[0];
        } else {
            return null;
        }
    }

    protected filterResultIfFieldMissing() {
        return false;
    }
}
