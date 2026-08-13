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
    private readonly _explanation: string | undefined;

    /**
     * Constructor:
     * @param instruction - Full text of the instruction for the filter: must be matched exactly, ignoring capitalisation.
     * @param filter
     * @param explanation - an optional explaination line. If not supplied, the supplied instruction line will be used.
     */
    constructor(instruction: string, filter: FilterFunction, explanation?: string) {
        this._instruction = instruction;
        this._filter = filter;
        this._explanation = explanation;
    }

    public canCreateFilterForLine(line: string): boolean {
        return line.toLocaleLowerCase() === this._instruction.toLocaleLowerCase();
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        if (this.canCreateFilterForLine(line)) {
            return FilterOrErrorMessage.fromFilter(
                new Filter(line, this._filter, new Explanation(this._explanation || line)),
            );
        }

        return FilterOrErrorMessage.fromError(line, `do not understand filter: ${line}`);
    }
}
