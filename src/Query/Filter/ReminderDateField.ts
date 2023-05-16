import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateField } from './DateField';

export class ReminderDateField extends DateField {
    public fieldName(): string {
        return 'reminder';
    }

    public date(task: Task): Moment | null {
        if (task.reminder) {
            return task.reminder.peek();
        } else {
            return null;
        }
    }

    protected filterResultIfFieldMissing() {
        return false;
    }
}
