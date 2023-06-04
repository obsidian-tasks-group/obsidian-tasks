import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { Grouper } from '../Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import { HappensDateField } from './HappensDateField';
import { RootField } from './RootField';
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

function groupByFn(task: Task, arg?: GroupingArg): string[] {
    const paramsArgs: [string, any][] = [
        ['created', task.createdDate],
        ['description', task.description],
        ['done', task.doneDate],
        ['due', task.dueDate],
        ['filename', task.filename],
        // ['folder', FolderField.folder(task.path, task.filename!)],
        ['happens', new HappensDateField().earliestDate(task)],
        ['header', task.precedingHeader],
        ['indentation', task.indentation],
        ['markdown', task.originalMarkdown],
        ['path', task.path],
        ['priority', task.priority],
        ['recurrence', task.recurrence],
        ['root', new RootField().value(task)],
        ['scheduled', task.scheduledDate],
        ['start', task.startDate],
        ['status', task.status],
        ['tags', task.tags],
        ['task', task],
        ['urgency', task.urgency],
    ];

    const params = paramsArgs.map(([p]) => p);
    const groupBy = arg && new Function(...params, `return ${arg}`);

    if (groupBy instanceof Function) {
        const args = paramsArgs.map(([_, a]) => a);
        const result = groupBy(...args);
        const group = typeof result === 'string' ? result : 'Error with group result';

        return [TextField.escapeMarkdownCharacters(group)];
    } else {
        return ['Error parsing group function'];
    }
}
