import type { Task } from '../../Task/Task';
import type { Explanation } from '../Explain/Explanation';
import type { SearchInfo } from '../SearchInfo';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 *
 * SearchInfo is being introduced as a Parameter Object, in order to later allow
 * more data to be passed from the Query down in to the individual filters.
 */
export type FilterFunction = (task: Task, searchInfo: SearchInfo) => boolean;

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
            return `${indent}${this.instruction} =>\n${explanation.asString(indent + '  ')}\n`;
        }
    }
}
