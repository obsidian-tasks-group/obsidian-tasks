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

    /**
     * Parse a sort instruction line, creating either a {@link Sorting} object or undefined,
     * if the line is unrecognised.
     * @param line - One of 'sort by due' or 'sort by due reverse'
     */
    public parseInstructionAndCreateSorter(line: string): Sorting | undefined {
        const sortByRegexp = /^sort by (due)( reverse)?/;
        const fieldMatch = line.match(sortByRegexp);
        if (fieldMatch !== null) {
            // const propertyName = fieldMatch[1];
            const reverse = !!fieldMatch[2];
            return this.createSorter(reverse);
        } else {
            return undefined;
        }
    }

    /**
     * Create a {@link Sorting} object for sorting tasks by their Status,
     * in the standard/normal sort order for this field.
     *
     * @see {@link createReverseSorter}
     */
    public createNormalSorter(): Sorting {
        return this.createSorter(false);
    }

    /**
     * Create a {@link Sorting} object for sorting tasks by their Status,
     * in the reverse of the standard/normal sort order for this field.
     *
     * @see {@link createNormalSorter}
     */
    public createReverseSorter(): Sorting {
        return this.createSorter(true);
    }

    /**
     * Create a {@link Sorting} object for sorting tasks by their Status.
     * @param reverse - false for normal sort order, true for reverse sort order.
     */
    protected createSorter(reverse: boolean): Sorting {
        return new Sorting(reverse, 1, 'due', DueDateField.comparator());
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by due.
     */
    public static comparator(): Comparator {
        // TODO Refactor to make non-static and use this.date(a), this.date(b)
        return (a: Task, b: Task) => {
            return Sort.compareByDate(a.dueDate, b.dueDate);
        };
    }
}
