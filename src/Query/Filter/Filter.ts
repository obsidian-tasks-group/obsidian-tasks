import type { Task } from '../../Task';
import type { Explanation } from '../Explain/Explanation';

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
    readonly explanation: Explanation;
    public filterFunction: FilterFunction;

    public constructor(instruction: string, filterFunction: FilterFunction, explanation: Explanation) {
        this.instruction = instruction;
        this.explanation = explanation;
        this.filterFunction = filterFunction;
    }

    public explainFilterIndented(indent: string) {
        const explanation = this.explanation;
        const unindentedExplanation = explanation.asString();
        if (unindentedExplanation === this.instruction) {
            return `${indent}${this.instruction}\n`;
        } else {
            return `${indent}${this.instruction} =>\n${explanation.asString('  ')}\n`;
        }
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
