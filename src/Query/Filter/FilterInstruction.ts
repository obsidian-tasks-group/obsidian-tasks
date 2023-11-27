import { Explanation } from '../Explain/Explanation';
import { Filter } from './Filter';
import type { FilterFunction } from './Filter';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

/**
 * Implementation of a single instruction for filtering tasks, and its corresponding predicate.
 *
 * This is really a helper to simplify the implementation of individual filter
 * instructions, hiding away the details of parsing individual instruction lines.
 *
 * This will usually be accessed via {@link FilterInstructions.add}
 *
 * @see FilterInstructions
 */
export class FilterInstruction {
    private readonly _instruction: string;
    private readonly _filter: FilterFunction;

    /**
     * Constructor:
     * @param instruction - Full text of the instruction for the filter: must be matched exactly, ignoring capitalisation.
     * @param filter
     */
    constructor(instruction: string, filter: FilterFunction) {
        this._instruction = instruction;
        this._filter = filter;
    }

    public canCreateFilterForLine(line: string): boolean {
        return line.toLocaleLowerCase() === this._instruction.toLocaleLowerCase();
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        if (this.canCreateFilterForLine(line)) {
            return FilterOrErrorMessage.fromFilter(new Filter(line, this._filter, new Explanation(line)));
        }

        return FilterOrErrorMessage.fromError(line, `do not understand filter: ${line}`);
    }
}
