import type { Task } from '../Task/Task';
import { FunctionOrError, evaluateExpression, evaluateExpressionOrCatch, parseExpression } from './Expression';
import type { QueryContext } from './QueryContext';

/**
 *  From: https://www.educative.io/answers/parameter-vs-argument
 *      A parameter is a variable in a function definition. It is a placeholder and hence does not have a concrete value.
 *      An argument is a value passed during function invocation.
 * @param task - during parsing, this can be null. During evaluation, it must be a Task
 * @param queryContext - during parsing, this can be null. During evaluation, it must be a QueryContext or undefined.
 */
export function constructArguments(task: Task | null, queryContext: QueryContext | null) {
    const paramsArgs: [string, any][] = [
        ['task', task],
        ['query', queryContext ? queryContext.query : null],
    ];
    return paramsArgs;
}

/**
 * Evaluate an arbitrary JavaScript expression on a Task object
 * @param task - a {@link Task} object
 * @param arg - a string, such as `task.path.startsWith("journal/") ? "journal/" : task.path`
 * @param queryContext - an optional {@link QueryContext} object
 *
 * Currently any errors are returned as string error messages, starting with the word 'Error'.
 *
 * @todo Implement a type-safe mechanism to report error messages distinct from expression results.
 *
 * See also {@link FunctionField} which exposes this facility to users.
 */
export function parseAndEvaluateExpression(task: Task, arg: string, queryContext?: QueryContext) {
    const paramsArgs = constructArguments(task, queryContext ? queryContext : null);

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
        return this.functionOrError.isValid();
    }

    public get parseError(): string | undefined {
        return this.functionOrError.error;
    }

    /**
     * Evaluate the expression on this task, or throw an exception if the calculation failed
     * @param task
     * @param queryContext - optional. If not supplied, query properties will be unavailable.
     *
     * @see evaluateOrCatch
     */
    public evaluate(task: Task, queryContext?: QueryContext) {
        if (!this.isValid()) {
            throw Error(
                `Error: Cannot evaluate an expression which is not valid: "${this.line}" gave error: "${this.parseError}"`,
            );
        }
        return evaluateExpression(
            this.functionOrError.queryComponent!,
            constructArguments(task, queryContext ? queryContext : null),
        );
    }

    /**
     * Evaluate the expression on this task, or return error text if the calculation failed
     * @param task
     * @param queryContext
     *
     * @see evaluate
     */
    public evaluateOrCatch(task: Task, queryContext: QueryContext) {
        if (!this.isValid()) {
            return `Error: Cannot evaluate an expression which is not valid: "${this.line}" gave error: "${this.parseError}"`;
        }
        return evaluateExpressionOrCatch(
            this.functionOrError.queryComponent!,
            constructArguments(task, queryContext),
            this.line,
        );
    }
}
