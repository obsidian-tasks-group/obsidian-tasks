import type { Task } from '../Task';
import {
    FunctionOrError,
    constructArguments,
    evaluateExpression,
    evaluateExpressionOrCatch,
    parseExpression,
} from './Expression';

/**
 * Encapsulate an expression that can be calculated from a {@link Task} object
 */
export class TaskExpression {
    public readonly line: string;
    private readonly functionOrError: FunctionOrError;

    public constructor(line: string) {
        this.line = line;
        this.functionOrError = parseExpression(constructArguments(null), line);
    }

    public isValid() {
        return this.functionOrError.error === undefined;
    }

    public get parseError(): string | undefined {
        return this.functionOrError.error;
    }

    /**
     * Evaluate the expression on this task, or throw an exception if the calculation failed
     * @param task
     *
     * @see evaluateOrCatch
     */
    public evaluate(task: Task) {
        if (!this.isValid()) {
            throw Error(
                `Error: Cannot evaluate an expression which is not valid: "${this.line}" gave error: "${this.parseError}"`,
            );
        }
        return evaluateExpression(this.functionOrError.queryComponent!, constructArguments(task));
    }

    /**
     * Evaluate the expression on this task, or return error text if the calculation failed
     * @param task
     *
     * @see evaluate
     */
    public evaluateOrCatch(task: Task) {
        if (!this.isValid()) {
            return `Error: Cannot evaluate an expression which is not valid: "${this.line}" gave error: "${this.parseError}"`;
        }
        return evaluateExpressionOrCatch(this.functionOrError.queryComponent!, constructArguments(task), this.line);
    }
}
