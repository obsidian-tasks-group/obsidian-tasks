import { FilterInstruction } from './FilterInstruction';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import type { FilterFunction } from './Filter';

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

    public add(instruction: string, filter: FilterFunction) {
        this._filters.push(new FilterInstruction(instruction, filter));
    }

    public canCreateFilterForLine(line: string): boolean {
        return this._filters.some((filter) => filter.canCreateFilterForLine(line));
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        for (const filter of this._filters) {
            const x = filter.createFilterOrErrorMessage(line);
            if (x.isValid()) {
                return x;
            }
        }

        return FilterOrErrorMessage.fromError(line, `do not understand filter: ${line}`);
    }
}
