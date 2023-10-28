import type { Task } from '../Task';
import { FunctionOrError, evaluateExpression, evaluateExpressionOrCatch, parseExpression } from './Expression';
import type { QueryContext } from './QueryContext';

/**
 *  From: https://www.educative.io/answers/parameter-vs-argument
 *      A parameter is a variable in a function definition. It is a placeholder and hence does not have a concrete value.
 *      An argument is a value passed during function invocation.
 * @param task - during parsing, this can be null. During evaluation, it must be a Task
 * @param _queryContext
 */
export function constructArguments(task: Task | null, _queryContext: QueryContext | null) {
    const paramsArgs: [string, any][] = [
        // TODO Later, pass in the Query too, for access to file properties
        ['task', task],
    ];
    return paramsArgs;
}

/**
 * Evaluate an arbitrary JavaScript expression on a Task object
 * @param task - a {@link Task} object
 * @param arg - a string, such as `task.path.startsWith("journal/") ? "journal/" : task.path`
 *
 * Currently any errors are returned as string error messages, starting with the word 'Error'.
 *
 * @todo Implement a type-safe mechanism to report error messages distinct from expression results.
 *
 * See also {@link FunctionField} which exposes this facility to users.
 */
export function parseAndEvaluateExpression(task: Task, arg: string) {
    const paramsArgs = constructArguments(task, null);

    const functionOrError = parseExpression(paramsArgs, arg);
    if (functionOrError.error) {
        return functionOrError.error;
    }

    return evaluateExpressionOrCatch(functionOrError.queryComponent!, paramsArgs, arg);
}

/**
 * Encapsulate an expression that can be calculated from a {@link Task} object
 */
export class TaskExpression {
    public readonly line: string;
    private readonly functionOrError: FunctionOrError;

    public constructor(line: string) {
        this.line = line;
        this.functionOrError = parseExpression(constructArguments(null, null), line);
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
     * @param _queryContext
     * @see evaluateOrCatch
     */
    public evaluate(task: Task, _queryContext?: QueryContext) {
        if (!this.isValid()) {
            throw Error(
                `Error: Cannot evaluate an expression which is not valid: "${this.line}" gave error: "${this.parseError}"`,
            );
        }
        return evaluateExpression(this.functionOrError.queryComponent!, constructArguments(task, null));
    }

    /**
     * Evaluate the expression on this task, or return error text if the calculation failed
     * @param task
     *
     * @param _queryContext
     * @see evaluate
     */
    public evaluateOrCatch(task: Task, _queryContext: QueryContext) {
        if (!this.isValid()) {
            return `Error: Cannot evaluate an expression which is not valid: "${this.line}" gave error: "${this.parseError}"`;
        }
        return evaluateExpressionOrCatch(
            this.functionOrError.queryComponent!,
            constructArguments(task, null),
            this.line,
        );
    }
}
