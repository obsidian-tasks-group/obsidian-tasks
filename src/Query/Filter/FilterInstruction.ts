import { Filter, FilterOrErrorMessage } from './Filter';

/**
 * Implementation of a single instruction for filtering tasks, and its corresponding predicate.
 * An example call is:
 *  new FilterInstruction( 'done', (task: Task) => task.status === Status.Done )
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
