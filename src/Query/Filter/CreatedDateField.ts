import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'created' search instruction.
 */
export class CreatedDateField extends DateField {
    public fieldName(): string {
        return 'created';
    }
    public date(task: Task): Moment | null {
        return task.createdDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
