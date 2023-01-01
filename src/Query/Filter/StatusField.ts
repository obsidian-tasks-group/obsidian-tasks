import { Status } from '../../Status';
import type { Task } from '../../Task';
import type { Comparator } from '../Sorter';
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
