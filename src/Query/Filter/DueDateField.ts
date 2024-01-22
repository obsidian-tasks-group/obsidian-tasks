import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'due' search instruction.
 */
export class DueDateField extends DateField {
    public fieldName(): string {
        return 'due';
    }
    public date(task: Task): Moment | null {
        return task.dueDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
