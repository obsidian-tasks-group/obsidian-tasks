import type { Task } from '../Task';
import { errorMessageForException } from '../lib/ExceptionTools';

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
export function parseAndEvaluateExpression(task: Task, arg: string | null) {
    const paramsArgs: [string, any][] = [
        // TODO Later, pass in the Query too, for access to file properties
        ['task', task],
    ];

    const params = paramsArgs.map(([p]) => p);
    const expression = arg && new Function(...params, `return ${arg}`);

    if (!(expression instanceof Function)) {
        // I have not managed to write a test that reaches here:
        return 'Error parsing group function';
    }

    const args = paramsArgs.map(([_, a]) => a);

    try {
        return expression(...args);
    } catch (e) {
        return errorMessageForException(`Failed calculating expression "${arg}"`, e);
    }
}
