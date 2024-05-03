import type { Task } from '../../Task/Task';
import { Explanation } from '../Explain/Explanation';
import type { SearchInfo } from '../SearchInfo';
import { Statement } from '../Statement';

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
 * It provides access to:
 *
 * - The original {@link instruction}, after processing of continuation lines and placeholders.
 * - An {@link explanation}, showing how the instruction was interpreted.
 * - A {@link statement}, which is a {@link Statement} object that gives access to the original text,
 *   for filters that were created by a {@link Query}.
 * - The {@link filterFunction} - a {@link FilterFunction} which tests whether a task matches the filter
 */
export class Filter {
    /** _statement may be updated later with {@link setStatement} */
    private _statement: Statement;

    readonly explanation: Explanation;
    public filterFunction: FilterFunction;

    public constructor(instruction: string, filterFunction: FilterFunction, explanation: Explanation) {
        this._statement = new Statement(instruction, instruction);
        this.explanation = explanation;
        this.filterFunction = filterFunction;
    }

    public get statement(): Statement {
        return this._statement;
    }

    /**
     * Optionally record more detail about the source statement.
     *
     * In tests, we only care about the actual instruction being parsed and executed.
     * However, in {@link Query}, we want the ability to show user more information.
     */
    public setStatement(statement: Statement) {
        this._statement = statement;
    }

    public get instruction(): string {
        return this._statement.anyPlaceholdersExpanded;
    }

    public explainFilterIndented(indent: string) {
        const explainedStatement = this._statement.explainStatement(indent);
        if (this.onlyNeedsOneLineExplanation()) {
            return `${explainedStatement}\n`;
        } else {
            return `${explainedStatement} =>\n${this.explanation.asString(indent + '  ')}\n`;
        }
    }

    public simulateExplainFilter() {
        if (this.onlyNeedsOneLineExplanation()) {
            return this.explanation;
        } else {
            return new Explanation(this.instruction + ' =>', [this.explanation]);
        }
    }

    private onlyNeedsOneLineExplanation() {
        return this.explanation.asString('') === this.instruction;
    }
}
