import type { Task } from '../../Task/Task';
import type { Comparator } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StatusField extends FilterInstructionsBasedField {
    constructor() {
        super();

        // Backwards-compatibility change: In Tasks 1.22.0 and earlier, all tasks
        // with any status character except space were considered by the status filter
        // instructions to be done.
        // In later versions:
        //   StatusType.DONE counts as done
        //   StatusType.CANCELLED counts as done
        //   StatusType.TODO counts as not done
        //   StatusType.IN_PROGRESS counts as not done
        //   StatusType.NON_TASK counts as done
        this._filters.add('done', (task: Task) => task.isDone);
        this._filters.add('not done', (task: Task) => !task.isDone);
    }

    public fieldName(): string {
        return 'status';
    }

    public supportsSorting(): boolean {
        return true;
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by status.
     * TODO and IN_PROGRESS types are sorted before the other types.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            const oldStatusNameA = StatusField.oldStatusName(a);
            const oldStatusNameB = StatusField.oldStatusName(b);
            if (oldStatusNameA < oldStatusNameB) {
                return 1;
            } else if (oldStatusNameA > oldStatusNameB) {
                return -1;
            } else {
                return 0;
            }
        };
    }

    private static oldStatusName(a: Task): string {
        if (!a.isDone) {
            return 'Todo';
        } else {
            return 'Done';
        }
    }

    public supportsGrouping(): boolean {
        return true;
    }

    /**
     * Return a function to name tasks, for use in grouping by status.
     * TODO and IN_PROGRESS types are grouped in 'Todo'.
     * Other status types are grouped in 'Done'.
     */
    public grouper(): GrouperFunction {
        return (task: Task) => {
            return [StatusField.oldStatusName(task)];
        };
    }
}
