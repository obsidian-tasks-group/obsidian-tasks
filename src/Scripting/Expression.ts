import { QueryComponentOrError } from '../Query/QueryComponentOrError';
import { errorMessageForException } from '../lib/ExceptionTools';

export class FunctionOrError extends QueryComponentOrError<Function> {}

/**
 * Parse a JavaScript expression, and return either a Function or an error message in a string.
 * @param paramsArgs
 * @param arg
 *
 * @see evaluateExpression
 * @see evaluateExpressionOrCatch
 */
export function parseExpression(paramsArgs: [string, any][], arg: string): FunctionOrError {
    try {
        const parameterNames = paramsArgs.map(([p]) => p);
        const input = arg.includes('return') ? arg : `return ${arg}`;
        const expression: '' | null | Function = arg && new Function(...parameterNames, input);
        if (expression instanceof Function) {
            return FunctionOrError.fromObject(arg, expression);
        }
        // I have not managed to write a test that reaches here:
        return FunctionOrError.fromError(arg, `Problem parsing expression "${arg}"`);
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
    const parameterValues = paramsArgs.map(([_, a]) => a);
    return expression(...parameterValues);
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
