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
     * TODO Separate the parsing of the line and construction of the {@link Sorting} in to two separate methods.
     * @param line - One of 'sort by status' or 'sort by status reverse'
     */
    public createSorter(line: string): Sorting | undefined {
        const sortByRegexp = /^sort by (status)( reverse)?/;
        const fieldMatch = line.match(sortByRegexp);
        if (fieldMatch !== null) {
            return new Sorting(!!fieldMatch[2], 1, fieldMatch[1], StatusField.comparator());
        } else {
            return undefined;
        }
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
