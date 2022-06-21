import { Filter, FilterOrErrorMessage } from './Filter';

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
    private readonly _filter: Filter;

    /**
     * Constructor:
     * @param instruction - Full text of the instruction for the filter: must be matched exactly
     * @param filter
     */
    constructor(instruction: string, filter: Filter) {
        this._instruction = instruction;
        this._filter = filter;
    }

    public canCreateFilterForLine(line: string): boolean {
        return line == this._instruction;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();

        if (line === this._instruction) {
            result.filter = this._filter;
            return result;
        }

        result.error = `do not understand filter: ${line}`;
        return result;
    }
}
