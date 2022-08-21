import type { Task } from '../../Task';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 */
export type Filter = (task: Task) => boolean;

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
    filter: Filter | undefined;
    error: string | undefined;

    /**
     * Construct a FilterOrErrorMessage with the filter.
     * @param filter
     */
    public static fromFilter(filter: Filter): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        result.filter = filter;
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
