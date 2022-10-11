import type { Task } from '../../Task';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 */
export type FilterFunction = (task: Task) => boolean;

export class Filter {
    // TODO Add storage of instruction line
    private _filterFunction: FilterFunction | undefined;

    // TODO Remove need to pass an undefined filter function in. Just take the instruction line.
    public constructor(filterFunction: FilterFunction | undefined) {
        this._filterFunction = filterFunction;
    }

    public get filterFunction(): FilterFunction | undefined {
        return this._filterFunction;
    }

    public set filterFunction(value: FilterFunction | undefined) {
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
    public get filterFunction(): FilterFunction | undefined {
        return this._filter.filterFunction;
    }

    public set filterFunction(value: FilterFunction | undefined) {
        this._filter.filterFunction = value;
    }

    private _filter: Filter;
    error: string | undefined;

    // TODO Add a constructor that takes a line
    constructor() {
        this._filter = new Filter(undefined);
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     * @param filter
     */
    public static fromFilter(filter: FilterFunction): FilterOrErrorMessage {
        // TODO Add line parameter
        const result = new FilterOrErrorMessage();
        result.filterFunction = filter;
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
