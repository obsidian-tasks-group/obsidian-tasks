import type { Task } from '../Task';
import { QueryComponentOrError } from '../Query/QueryComponentOrError';
import { errorMessageForException } from '../lib/ExceptionTools';

export class FunctionOrError extends QueryComponentOrError<Function> {}

/**
 *  From: https://www.educative.io/answers/parameter-vs-argument
 *      A parameter is a variable in a function definition. It is a placeholder and hence does not have a concrete value.
 *      An argument is a value passed during function invocation.
 * @param task - during parsing, this can be null. During evaluation, it must be a Task
 */
export function constructArguments(task: Task | null) {
    // TODO Move this to TaskExpression
    const paramsArgs: [string, any][] = [
        // TODO Later, pass in the Query too, for access to file properties
        ['task', task],
    ];
    return paramsArgs;
}

/**
 * Parse a JavaScript expression, and return either a Function or an error message in a string.
 * @param paramsArgs
 * @param arg
 *
 * @see evaluateExpression
 * @see evaluateExpressionOrCatch
 */
export function parseExpression(paramsArgs: [string, any][], arg: string): FunctionOrError {
    const params = paramsArgs.map(([p]) => p);
    try {
        const input = arg.includes('return') ? arg : `return ${arg}`;
        const expression: '' | null | Function = arg && new Function(...params, input);
        if (expression instanceof Function) {
            return FunctionOrError.fromObject(arg, expression);
        }
        // I have not managed to write a test that reaches here:
        return FunctionOrError.fromError(arg, 'Error parsing group function');
    } catch (e) {
        return FunctionOrError.fromError(arg, errorMessageForException(`Failed parsing expression "${arg}"`, e));
    }
}

/**
 * Evaluate an arbitrary JavaScript expression, throwing an exception if the calculation failed.
 * @param expression
 * @param paramsArgs
 *
 * @see parseExpression
 * @see evaluateExpressionOrCatch
 */
export function evaluateExpression(expression: Function, paramsArgs: [string, any][]) {
    const args = paramsArgs.map(([_, a]) => a);
    return expression(...args);
}

/**
 * Evaluate an arbitrary JavaScript expression, returning an error message if the calculation failed.
 * @param expression
 * @param paramsArgs
 * @param arg
 *
 * @see parseExpression
 * @see evaluateExpression
 */
export function evaluateExpressionOrCatch(expression: Function, paramsArgs: [string, any][], arg: string) {
    try {
        return evaluateExpression(expression, paramsArgs);
    } catch (e) {
        return errorMessageForException(`Failed calculating expression "${arg}"`, e);
    }
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
    const paramsArgs = constructArguments(task);

    const functionOrError = parseExpression(paramsArgs, arg);
    if (functionOrError.error) {
        return functionOrError.error;
    }

    return evaluateExpressionOrCatch(functionOrError.queryComponent!, paramsArgs, arg);
}
