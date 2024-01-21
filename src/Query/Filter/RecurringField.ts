import type { Task } from '../../Task/Task';
import type { GrouperFunction } from '../Group/Grouper';
import type { Comparator } from '../Sort/Sorter';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class RecurringField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is recurring', (task) => task.recurrence !== null);
        this._filters.add('is not recurring', (task) => task.recurrence === null);
    }

    public fieldName(): string {
        return 'recurring';
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    public supportsSorting(): boolean {
        return true;
    }

    comparator(): Comparator {
        // Recurring tasks sort before non-recurring ones
        return (a: Task, b: Task) => {
            if (a.recurrence !== null && b.recurrence === null) {
                return -1;
            } else if (a.recurrence === null && b.recurrence !== null) {
                return 1;
            } else {
                return 0;
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            if (task.recurrence !== null) {
                return ['Recurring'];
            } else {
                return ['Not Recurring'];
            }
        };
    }
}
