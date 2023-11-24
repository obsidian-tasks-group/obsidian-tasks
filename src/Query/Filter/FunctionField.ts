import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Grouper } from '../Grouper';
import { Explanation } from '../Explain/Explanation';
import { TaskExpression, parseAndEvaluateExpression } from '../../Scripting/TaskExpression';
import type { QueryContext } from '../../Scripting/QueryContext';
import type { SearchInfo } from '../SearchInfo';
import { Field } from './Field';
import { Filter, type FilterFunction } from './Filter';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

/**
 * A {@link Field} implement that accepts a JavaScript expression to filter or group tasks.
 *
 * See also {@link parseAndEvaluateExpression}
 */
export class FunctionField extends Field {
    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const match = Field.getMatch(this.filterRegExp(), line);
        if (match === null) {
            return FilterOrErrorMessage.fromError(line, 'Unable to parse line');
        }

        const expression = match[1];
        const taskExpression = new TaskExpression(expression);
        if (!taskExpression.isValid()) {
            return FilterOrErrorMessage.fromError(line, taskExpression.parseError!);
        }

        return FilterOrErrorMessage.fromFilter(
            new Filter(line, createFilterFunctionFromLine(taskExpression), new Explanation(line)),
        );
    }

    fieldName(): string {
        return 'function';
    }

    protected filterRegExp(): RegExp | null {
        return new RegExp(`^filter by ${this.fieldNameSingularEscaped()} (.*)`, 'i');
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
        return new RegExp(`^group by ${this.fieldNameSingularEscaped()}( reverse)? (.*)`, 'i');
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

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

function createFilterFunctionFromLine(expression: TaskExpression): FilterFunction {
    return (task: Task, searchInfo: SearchInfo) => {
        const queryContext = searchInfo.queryContext();
        return filterByFunction(expression, task, queryContext);
    };
}

export function filterByFunction(expression: TaskExpression, task: Task, queryContext?: QueryContext): boolean {
    // Allow exceptions to propagate to caller, since this will be called in a tight loop.
    // In searches, it will be caught by Query.applyQueryToTasks().
    const result = expression.evaluate(task, queryContext);

    // We insist that 'filter by function' returns booleans,
    // to avoid users having to understand truthy and falsey values.
    if (typeof result === 'boolean') {
        return result;
    }

    throw Error(`filtering function must return true or false. This returned "${result}".`);
}

// -----------------------------------------------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------------------------------------------

type GroupingArg = string;

function createGrouperFunctionFromLine(line: string): GrouperFunction {
    return (task: Task, searchInfo: SearchInfo) => {
        const queryContext = searchInfo.queryContext();
        return groupByFunction(task, line, queryContext);
    };
}

export function groupByFunction(task: Task, arg: GroupingArg, queryContext?: QueryContext): string[] {
    try {
        const result = parseAndEvaluateExpression(task, arg, queryContext);

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
