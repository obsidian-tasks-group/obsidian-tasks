import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
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
