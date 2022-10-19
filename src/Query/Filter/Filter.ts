import type { Task } from '../../Task';
import { Explanation } from '../Explain/Explanation';

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
 * - The original {@link instruction}
 * - The {@link filterFunction} - a {@link FilterFunction} which tests whether a task matches the filter
 *
 * Later, the plan is to add a human-readable explanation of the filter.
 */
export class Filter {
    readonly instruction: string;
    explanation: Explanation; // TODO Add an Explanation arg to constructor, and then make this readonly again
    public filterFunction: FilterFunction;

    public constructor(instruction: string, filterFunction: FilterFunction) {
        this.instruction = instruction;
        // TODO Incrementally obtain this from the Field classes, to get meaningful explanations
        this.explanation = new Explanation(instruction);
        this.filterFunction = filterFunction;
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
export class FilterOrErrorMessage {
    readonly instruction: string;
    private _filter: Filter | undefined;
    error: string | undefined;

    constructor(instruction: string) {
        this.instruction = instruction;
    }

    public get filter(): Filter | undefined {
        return this._filter;
    }

    set filter(value: Filter | undefined) {
        this._filter = value;
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
            this._filter = new Filter(this.instruction, value);
        } else {
            this._filter = undefined;
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
        const result = new FilterOrErrorMessage(filter.instruction);
        result.filter = filter;
        return result;
    }

    /**
     * Construct a FilterOrErrorMessage with the filter function.
     *
     * Prefer {@link fromFilter} instead.
     *
     * @param instruction
     * @param filter - a {@link FilterFunction}
     */
    public static fromFilterFunction(instruction: string, filter: FilterFunction): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(instruction);
        result.filterFunction = filter;
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
