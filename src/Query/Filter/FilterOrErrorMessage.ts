import { ObjectOrErrorMessage } from '../ObjectOrErrorMessage';
import type { Filter, FilterFunction } from './Filter';

/**
 * A class which stores one of:
 * - The original instruction string - a line from a tasks code block
 * - An optional {@link Filter}
 * - An optional error message
 *
 * This is really currently a convenience for returning data from
 * {@link Field.createFilterOrErrorMessage()} and derived classes.
 *
 * By the time the code has finished with parsing the line, typically the
 * contained {@link Filter} will be saved, for later use in searching for Tasks
 * that match the user's filter instruction.
 *
 * Later, it may gain helper functions for constructing parser error messages,
 * as currently these are created by some rather repetitious code, and also
 * there is scope for making these messages more informative (including the
 * problem line, and perhaps listing allowed options).
 */
export class FilterOrErrorMessage {
    public object: ObjectOrErrorMessage;

    constructor(object: ObjectOrErrorMessage) {
        this.object = object;
    }

    public get instruction(): string {
        return this.object.instruction;
    }

    public get filter(): Filter | undefined {
        return this.object.object;
    }

    public get error(): string | undefined {
        return this.object.error;
    }

    get filterFunction(): FilterFunction | undefined {
        if (this.filter) {
            return this.filter.filterFunction;
        } else {
            return undefined;
        }
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     *
     * This function allows a meaningful {@link Explanation} to be supplied.
     *
     * @param filter - a {@link Filter}
     */
    public static fromFilter(filter: Filter): FilterOrErrorMessage {
        const object = ObjectOrErrorMessage.fromObject(filter.instruction, filter);
        return new FilterOrErrorMessage(object);
    }

    public static fromError(instruction: string, errorMessage: string): FilterOrErrorMessage {
        const object = ObjectOrErrorMessage.fromError(instruction, errorMessage);
        return new FilterOrErrorMessage(object);
    }
}
