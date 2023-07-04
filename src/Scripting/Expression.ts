import type { Task } from '../Task';
import { errorMessageForException } from '../lib/ExceptionTools';

/**
 *  From: https://www.educative.io/answers/parameter-vs-argument
 *      A parameter is a variable in a function definition. It is a placeholder and hence does not have a concrete value.
 *      An argument is a value passed during function invocation.
 * @param task
 */
export function constructArguments(task: Task) {
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
export function parseExpression(paramsArgs: [string, any][], arg: string): Function | string {
    const params = paramsArgs.map(([p]) => p);
    try {
        const expression: '' | null | Function = arg && new Function(...params, `return ${arg}`);
        if (expression instanceof Function) {
            return expression;
        }
        // I have not managed to write a test that reaches here:
        return 'Error parsing group function';
    } catch (e) {
        return errorMessageForException(`Failed parsing expression "${arg}"`, e);
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

    const expression = parseExpression(paramsArgs, arg);
    if (typeof expression === 'string') {
        // It's an error message
        return expression;
    }

    return evaluateExpressionOrCatch(expression, paramsArgs, arg);
}
