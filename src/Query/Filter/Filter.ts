import type { Task } from '../../Task';
import type { Explanation } from '../Explain/Explanation';

/**
 * A filtering function, that takes a Task object and returns
 * whether it matches a particular filtering instruction.
 *
 * The complete list of tasks is also passed in, to allow the filter
 * to optionally use information from other tasks in the vault.
 * For example, this is needed for filters involving task dependencies.
 */
export type FilterFunction = (task: Task, allTasks: Task[]) => boolean;

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
