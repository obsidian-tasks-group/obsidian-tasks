import type { Moment } from 'moment';
import type { Task } from '../../Task';
import type { Comparator } from '../Sort';
import { Sort, Sorting } from '../Sort';
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

    public createSorter(reverse: boolean): Sorting {
        return new Sorting(reverse, 1, this.fieldName(), this.comparator());
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by due.
     */
    public comparator(): Comparator {
        // TODO Refactor to make non-static and use this.date(a), this.date(b)
        return (a: Task, b: Task) => {
            return Sort.compareByDate(a.dueDate, b.dueDate);
        };
    }
}
