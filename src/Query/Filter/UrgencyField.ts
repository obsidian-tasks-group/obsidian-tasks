import type { Comparator } from '../Sort/Sorter';
import type { Task } from '../../Task/Task';
import type { Grouper, GrouperFunction } from '../Group/Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

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

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            // Higher urgency should be sorted earlier.
            return b.urgency - a.urgency;
        };
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        // Note: Groups are sorted from low priority to high.
        // This will be improved in a future release, by allowing
        // the grouping code to take advantage of the comparator()
        // method above.
        return (task: Task) => {
            return [`${task.urgency.toFixed(2)}`];
        };
    }

    /**
     * The {@link Field.createGrouper} creates a grouper that sorts by increasing values.
     * For {@link UrgencyField} the group sorting shall be done by decreasing values, so
     * the normal order here is the reverse of the regular one.
     *
     * @param reverse - false for normal group order (from most urgent to less urgent),
     * true for reverse group order.
     */
    public createGrouper(reverse: boolean): Grouper {
        return super.createGrouper(!reverse);
    }

    protected grouperInstruction(reverse: boolean) {
        return super.grouperInstruction(!reverse);
    }
}
