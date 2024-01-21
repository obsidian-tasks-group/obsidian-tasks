import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'done' search instruction.
 */
export class DoneDateField extends DateField {
    public fieldName(): string {
        return 'done';
    }
    public date(task: Task): Moment | null {
        return task.doneDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
