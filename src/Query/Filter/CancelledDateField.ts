import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'cancelled' search instruction.
 */
export class CancelledDateField extends DateField {
    public fieldName(): string {
        return 'cancelled';
    }
    public date(task: Task): Moment | null {
        return task.cancelledDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
