import type { Task } from '../../Task';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 */
export type Filter = (task: Task) => boolean;

export class NewFilter {
    // TODO Remove the use of undefined here. Move it to FilterOrErrorMessage.
    // TODO Add storage of instruction line
    private _filterFunction: Filter | undefined;

    // TODO Take the instruction line.
    public constructor() {
        this._filterFunction = undefined;
    }

    public get filterFunction(): Filter | undefined {
        return this._filterFunction;
    }

    public set filterFunction(value: Filter | undefined) {
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
    public get filter(): Filter | undefined {
        return this._filter.filterFunction;
    }

    public set filter(value: Filter | undefined) {
        this._filter.filterFunction = value;
    }

    private _filter: NewFilter;
    error: string | undefined;

    // TODO Add a constructor that takes a line
    constructor() {
        this._filter = new NewFilter();
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     * @param filter
     */
    public static fromFilter(filter: Filter): FilterOrErrorMessage {
        // TODO Add line parameter
        const result = new FilterOrErrorMessage();
        result.filter = filter;
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
