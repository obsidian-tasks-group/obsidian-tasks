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

    public supportsSorting(): boolean {
        return true;
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

    public createSorter(reverse: boolean): Sorting {
        return new Sorting(reverse, 1, 'status', this.comparator());
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by status.
     */
    public comparator(): Comparator {
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
