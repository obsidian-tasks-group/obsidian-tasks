import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Grouper } from '../Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import { TextField } from './TextField';

export class FunctionField extends Field {
    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Searching by custom function not yet implemented');
    }

    fieldName(): string {
        return 'function';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public createGrouperFromLine(line: string): Grouper | null {
        const match = Field.getMatch(this.grouperRegExp(), line);
        if (match === null) {
            return null;
        }
        const reverse = !!match[1];
        const args = match[2];
        return new Grouper('function', createGrouperFunctionFromLine(args), reverse);
    }

    protected grouperRegExp(): RegExp {
        return new RegExp(`^group by ${this.fieldNameSingularEscaped()}( reverse)? (.*)`);
    }

    /**
     * This method does not work for 'group by function' as the user's instruction line
     * is required in order to create the {@link GrouperFunction}.
     *
     * So this class overrides {@link createGrouperFromLine} instead.
     * @throws Error
     */
    public grouper(): GrouperFunction {
        throw Error('grouper() function not valid for FunctionField. Use createGrouperFromLine() instead.');
    }
}

type GroupingArg = string | null;

function createGrouperFunctionFromLine(line: string): GrouperFunction {
    return (task: Task) => {
        return groupByFn(task, line);
    };
}

/**
 * Evaluate an arbitrary JavaScript expression on a Task object
 * @param task - a {@link Task} object
 * @param arg - a string, such as `task.path.startsWith("journal/") ? "journal/" : task.path`
 *
 * Currently any errors are returned as string error messages, starting with the word 'Error'.
 *
 * @todo Implement a type-safe mechanism to report error messages distinct from expression results.
 */
export function evaluateExpression(task: Task, arg: string | null) {
    const paramsArgs: [string, any][] = [
        // TODO Later, pass in the Query too, for access to file properties
        ['task', task],
    ];

    const params = paramsArgs.map(([p]) => p);
    const groupBy = arg && new Function(...params, `return ${arg}`);

    if (!(groupBy instanceof Function)) {
        // I have not managed to write a test that reaches here:
        return 'Error parsing group function';
    }

    const args = paramsArgs.map(([_, a]) => a);

    try {
        return groupBy(...args);
    } catch (e) {
        const errorMessage = `Error: Failed calculating expression "${arg}". The error message was: `;
        if (e instanceof Error) {
            return errorMessage + e.message;
        } else {
            return errorMessage + 'Unknown error';
        }
    }
}

export function groupByFn(task: Task, arg: GroupingArg): string[] {
    const result = evaluateExpression(task, arg);

    const requiredType = 'string';
    const group = typeof result === requiredType ? result : result.toString();

    if (group.length > 0) {
        return [TextField.escapeMarkdownCharacters(group)];
    } else {
        return [];
    }
}
