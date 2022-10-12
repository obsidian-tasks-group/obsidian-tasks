import type { Task } from '../../Task';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 */
export type FilterFunction = (task: Task) => boolean;

/**
 * A class that represents a parsed filtering instruction from a tasks code block.
 *
 * Currently it provides access to:
 *
 * - The {@link filterFunction} - a {@link FilterFunction} which tests whether a task matches the filter
 *
 * Later, the plan is to add storage of the user's instruction, and a human-readable explanation of the filter.
 */
export class Filter {
    public filterFunction: FilterFunction;

    public constructor(filterFunction: FilterFunction) {
        this.filterFunction = filterFunction;
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
    readonly instruction: string;
    private _filter: Filter | undefined;
    error: string | undefined;

    constructor(instruction: string = 'UNKNOWN') {
        this.instruction = instruction;
    }

    public get filter(): Filter | undefined {
        return this._filter;
    }

    get filterFunction(): FilterFunction | undefined {
        if (this._filter) {
            return this._filter.filterFunction;
        } else {
            return undefined;
        }
    }

    set filterFunction(value: FilterFunction | undefined) {
        if (value) {
            this._filter = new Filter(value);
        } else {
            this._filter = undefined;
        }
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     * @param filter
     */
    public static fromFilter(filter: FilterFunction): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        result.filterFunction = filter;
        return result;
    }

    /**
     * Construct a FilterOrErrorMessage with the given error message.
     * @param errorMessage
     */
    public static fromError(errorMessage: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        result.error = errorMessage;
        return result;
    }
}
