import type { Filter, FilterFunction } from './Filter';

class ObjectOrErrorMessage {
    readonly instruction: string;
    private _object: Filter | undefined;
    private _error: string | undefined;

    constructor(instruction: string) {
        this.instruction = instruction;
    }

    public get object(): Filter | undefined {
        return this._object;
    }

    protected set object(value: Filter | undefined) {
        this._object = value;
    }

    public get error(): string | undefined {
        return this._error;
    }

    private set error(value: string | undefined) {
        this._error = value;
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     *
     * This function allows a meaningful {@link Explanation} to be supplied.
     *
     * @param object - a {@link Filter}
     */
    public static fromObject(object: Filter): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(object.instruction);
        result._object = object;
        return result;
    }

    /**
     * Construct a FilterOrErrorMessage with the given error message.
     * @param instruction
     * @param errorMessage
     */
    public static fromError(instruction: string, errorMessage: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(instruction);
        result._error = errorMessage;
        return result;
    }
}

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
export class FilterOrErrorMessage extends ObjectOrErrorMessage {
    constructor(instruction: string) {
        super(instruction);
    }

    public get filter(): Filter | undefined {
        return this.object;
    }

    private set filter(value: Filter | undefined) {
        this.object = value;
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
        return FilterOrErrorMessage.fromObject(filter);
    }
}
