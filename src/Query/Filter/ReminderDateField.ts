import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'reminder' search instruction.
 */
export class ReminderDateField extends DateField {
    public fieldName(): string {
        return 'reminder';
    }
    public date(task: Task): Moment | null {
        return task.reminderDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
