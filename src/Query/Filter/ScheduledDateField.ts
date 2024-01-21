import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'scheduled' search instruction.
 */
export class ScheduledDateField extends DateField {
    public fieldName(): string {
        return 'scheduled';
    }
    public date(task: Task): Moment | null {
        return task.scheduledDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
