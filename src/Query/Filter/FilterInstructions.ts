import { FilterInstruction } from './FilterInstruction';
import { Filter, FilterOrErrorMessage } from './Filter';

/**
 * Implementation of a collection of instructions for filtering tasks.
 *
 * @example
 *     private readonly _filters = new FilterInstructions();
 *     this._filters.add('is recurring', (task) => task.recurrence !== null);
 *
 * @see FilterInstruction
 */
export class FilterInstructions {
    private readonly _filters: FilterInstruction[] = [];

    public add(instruction: string, filter: Filter) {
        this._filters.push(new FilterInstruction(instruction, filter));
    }

    public canCreateFilterForLine(line: string): boolean {
        for (const filter of this._filters) {
            if (filter.canCreateFilterForLine(line)) {
                return true;
            }
        }
        return false;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        for (const filter of this._filters) {
            const x = filter.createFilterOrErrorMessage(line);
            if (x.error === undefined) {
                return x;
            }
        }

        const result = new FilterOrErrorMessage();
        result.error = `do not understand filter: ${line}`;
        return result;
    }
}
