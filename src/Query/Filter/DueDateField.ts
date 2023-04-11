import type { Moment } from 'moment';
import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
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

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            const date = this.date(task);
            if (date === null) {
                return ['No ' + this.fieldName() + ' date'];
            }
            return [date.format('YYYY-MM-DD dddd')];
        };
    }
}
