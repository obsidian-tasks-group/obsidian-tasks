import type { Moment } from 'moment';
import type { Task } from '../../Task';
import type { Comparator } from '../Sorting';
import { DateField } from './DateField';

/**
 * Support the 'due' search instruction.
 */
export class DueDateField extends DateField {
    private static readonly dueRegexp = /^due (before|after|on)? ?(.*)/;

    protected filterRegExp(): RegExp {
        return DueDateField.dueRegexp;
    }
    public fieldName(): string {
        return 'due';
    }
    public date(task: Task): Moment | null {
        return task.dueDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }

    public supportsSorting(): boolean {
        return true;
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by due.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return DateField.compareByDate(this.date(a), this.date(b));
        };
    }
}
