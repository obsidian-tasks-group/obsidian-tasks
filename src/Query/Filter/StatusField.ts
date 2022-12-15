import { Status, Task } from '../../Task';
import type { Comparator } from '../Sort';
import { Sorting } from '../Sort';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StatusField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('done', (task: Task) => task.status === Status.DONE);
        this._filters.add('not done', (task: Task) => task.status !== Status.DONE);
    }

    public fieldName(): string {
        return 'status';
    }

    /**
     * Parse a sort instruction line, creating either a {@link Sorting} object or undefined,
     * if the line is unrecognised.
     * @param line - One of 'sort by status' or 'sort by status reverse'
     */
    public parseInstructionAndCreateSorter(line: string): Sorting | undefined {
        const sortByRegexp = /^sort by (status)( reverse)?/;
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
     * Create a {@link Sorting} object for sorting tasks by their Status.
     * @param reverse - false for normal sort order, true for reverse sort order.
     */
    public createSorter(reverse: boolean): Sorting {
        return new Sorting(reverse, 1, 'status', StatusField.comparator());
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by status.
     */
    public static comparator(): Comparator {
        return (a: Task, b: Task) => {
            if (a.status < b.status) {
                return 1;
            } else if (a.status > b.status) {
                return -1;
            } else {
                return 0;
            }
        };
    }
}
