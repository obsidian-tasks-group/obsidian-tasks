import type { Comparator } from '../Sorting';
import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/**
 * Support 'urgency' sorting.
 *
 * Note: Searching by urgency is not yet implemented.
 */
export class UrgencyField extends Field {
    canCreateFilterForLine(_line: string): boolean {
        return false;
    }

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Filtering by urgency is not yet supported');
    }

    fieldName(): string {
        return 'urgency';
    }

    protected filterRegExp(): RegExp | null {
        throw Error(`filterRegExp() unimplemented for ${this.fieldName()}`);
    }

    supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            // Higher urgency should be sorted earlier.
            return b.urgency - a.urgency;
        };
    }
}
