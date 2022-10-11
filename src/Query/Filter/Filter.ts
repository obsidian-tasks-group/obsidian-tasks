import type { Task } from '../../Task';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 */
export type FilterFunction = (task: Task) => boolean;

export class Filter {
    private readonly _filterFunction: FilterFunction | undefined;

    public constructor(filterFunction: FilterFunction | undefined) {
        this._filterFunction = filterFunction;
    }

    public get filterFunction(): FilterFunction | undefined {
        return this._filterFunction;
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
    public get filterFunction(): FilterFunction | undefined {
        return this._filterFunction;
    }

    public set filterFunction(value: FilterFunction | undefined) {
        this._filterFunction = value;
    }

    // TODO Change storage from FilterFunction to Filter
    private _filterFunction: FilterFunction | undefined;
    error: string | undefined;

    // TODO Add a constructor that takes a line

    /**
     * Construct a FilterOrErrorMessage with the filter.
     * @param filter
     */
    public static fromFilter(filter: FilterFunction): FilterOrErrorMessage {
        // TODO Add line parameter
        const result = new FilterOrErrorMessage();
        result._filterFunction = filter;
        return result;
    }

    /**
     * Construct a FilterOrErrorMessage with the given error message.
     * @param errorMessage
     */
    public static fromError(errorMessage: string): FilterOrErrorMessage {
        // TODO Add line parameter
        const result = new FilterOrErrorMessage();
        result.error = errorMessage;
        return result;
    }
}
