import type { Task } from '../../Task';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 */
export type FilterFunction = (task: Task) => boolean;

// TODO Rename to Filter
// TODO Add docs
export class NewFilter {
    instruction: string;
    private _filterFunction: FilterFunction;

    public constructor(instruction: string, filterFunction: FilterFunction) {
        this.instruction = instruction;
        this._filterFunction = filterFunction;
    }

    // TODO Add operator that tests a Task matches - to remove need to call newFilter.filterFunction

    // TODO Can I remove getter?
    public get filterFunction(): FilterFunction {
        return this._filterFunction;
    }

    // TODO Can I remove setter?
    public set filterFunction(value: FilterFunction) {
        this._filterFunction = value;
    }
}

/**
 * A class which stores one of:
 * - A Filter
 * - An error message
 *
 * This is really currently a convenience for returning date from
 * Field.createFilterOrErrorMessage() and derived classes.
 *
 * Later, it may gain helper functions for constructing parser error messages,
 * as currently these are created by some rather repetitious code, and also
 * there is scope for making these messages more informative (including the
 * problem line, and perhaps listing allowed options).
 */
export class FilterOrErrorMessage {
    instruction: string;
    private _filter: NewFilter | undefined;
    error: string | undefined;

    constructor(instruction: string) {
        this.instruction = instruction;
    }

    // TODO Rename this to filter()
    public get newFilter(): NewFilter | undefined {
        return this._filter;
    }

    // TODO Can I remove this?
    public get filter(): FilterFunction | undefined {
        if (this._filter) {
            return this._filter.filterFunction;
        } else {
            return undefined;
        }
    }

    // TODO Can I remove this?
    public set filter(value: FilterFunction | undefined) {
        if (value) {
            this._filter = new NewFilter(this.instruction, value);
        } else {
            this._filter = undefined;
        }
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     * @param instruction
     * @param filter
     */
    public static fromFilter(instruction: string, filter: FilterFunction): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(instruction);
        result.filter = filter;
        return result;
    }

    /**
     * Construct a FilterOrErrorMessage with the given error message.
     * @param instruction
     * @param errorMessage
     */
    public static fromError(instruction: string, errorMessage: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(instruction);
        result.error = errorMessage;
        return result;
    }
}
