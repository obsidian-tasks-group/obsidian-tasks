import { evaluateExpression } from '../../Scripting/Expression';
import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Grouper } from '../Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/**
 * A {@link Field} implement that accepts a JavaSscript expression to group tasks together.
 *
 * See also {@link evaluateExpression}
 */
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

type GroupingArg = string;

function createGrouperFunctionFromLine(line: string): GrouperFunction {
    return (task: Task) => {
        return groupByFunction(task, line);
    };
}

export function groupByFunction(task: Task, arg: GroupingArg): string[] {
    try {
        const result = evaluateExpression(task, arg);

        if (Array.isArray(result)) {
            return result.map((h) => h.toString());
        }

        // Task uses null to represent missing information.
        // So we treat null as an empty group or 'not in a heading', for simplicity for users.
        // This can be overridden with 'null || "No value"
        if (result === null) {
            return [];
        }

        // If there was an error in the expression, like it referred to
        // an unknown task field, result will be undefined, and the call
        // on undefined.toString() will give an exception and a useful error
        // message below. This is a feature: it gives users feedback on the problem
        // instruction line.
        const group = result.toString();
        return [group];
    } catch (e) {
        const errorMessage = `Error: Failed calculating expression "${arg}". The error message was: `;
        if (e instanceof Error) {
            return [errorMessage + e.message];
        } else {
            return [errorMessage + 'Unknown error'];
        }
    }
}
