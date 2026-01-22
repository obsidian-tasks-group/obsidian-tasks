import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import { getSettings } from '../Config/Settings';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import { PriorityTools } from '../lib/PriorityTools';
import type { Priority } from '../Task/Priority';
import type { Task } from '../Task/Task';
import { DefaultTaskSerializer, taskIdRegex, taskIdSequenceRegex } from './DefaultTaskSerializer';

/**
 * Takes a regex of the form 'key:: value' and turns it into a regex that can parse
 * Dataview inline field, i.e either;
 *     * (key:: value)
 *     * [key:: value]
 *
 * There can be an arbitrary amount of horizontal whitespace around the key value pair,
 * and after the '::'
 */
function toInlineFieldRegex(innerFieldRegex: RegExp): RegExp {
    /**
     * First, I'm sorry this looks so bad. Javascript's regex engine lacks some
     * conveniences from other engines like PCRE (duplicate named groups)
     * that would've made this easier to express in a readable way.
     *
     * The idea here is that we're trying to say, in English:
     *
     *     "{@link innerFieldRegex} can either be surrounded by square brackets `[]`
     *     or parens `()`"
     *
     * But there is added complexity because we want to disallow mismatched pairs
     *   (i.e. no `[key::value) or (key::value]`). And we have to take care to not
     * introduce new capture groups, since innerFieldRegex may contain capture groups
     * and depend on the numbering.
     *
     * We achieve this by using a variable length, positive lookahead to assert
     * "Only match a the first element of the pair if the other element is somewhere further in the string".
     *
     * This is likely somewhat fragile.
     *
     */
    const fieldRegex = (
        [
            '(?:',
            /*     */ /(?=[^\]]+\])\[/, // Try to match '[' if there's a ']' later in the string
            /*    */ '|',
            /*     */ /(?=[^)]+\))\(/, // Otherwise, match '(' if there's a ')' later in the string
            ')',
            / */,
            innerFieldRegex,
            / */,
            /[)\]]/,
            /(?: *,)?/, // Allow trailing comma, enables workaround from #1913 for rendering issue
            /$/, // Regexes are matched from the end of the string forwards
        ] as const
    )
        .map((val) => (val instanceof RegExp ? val.source : val))
        .join('');
    return new RegExp(fieldRegex, innerFieldRegex.flags);
}

// Helpers to build a regex for the configured date format (Moment-like tokens),
// including optional wiki-link brackets [[...]] around the date value.
function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function momentFormatToRegex(format: string): string {
    let i = 0;
    let out = '';
    while (i < format.length) {
        const substr = format.substring(i);
        if (substr.startsWith('YYYY')) {
            out += '\\d{4}';
            i += 4;
            continue;
        }
        if (substr.startsWith('YY')) {
            out += '\\d{2}';
            i += 2;
            continue;
        }
        if (substr.startsWith('MMMM')) {
            out += '[A-Za-z]+';
            i += 4;
            continue;
        }
        if (substr.startsWith('MMM')) {
            out += '[A-Za-z]{3}';
            i += 3;
            continue;
        }
        if (substr.startsWith('MM')) {
            out += '\\d{2}';
            i += 2;
            continue;
        }
        if (substr.startsWith('M')) {
            out += '\\d{1,2}';
            i += 1;
            continue;
        }
        if (substr.startsWith('DD')) {
            out += '\\d{2}';
            i += 2;
            continue;
        }
        if (substr.startsWith('D')) {
            out += '\\d{1,2}';
            i += 1;
            continue;
        }
        // Literal character
        out += escapeRegex(format[i]);
        i += 1;
    }
    return out;
}

function buildConfiguredDateValueRegex(): string {
    const { taskDateFormat } = getSettings();
    const fmt = taskDateFormat && taskDateFormat.trim().length > 0 ? taskDateFormat : TaskRegularExpressions.dateFormat;
    const inner = momentFormatToRegex(fmt);
    // [[DATE]] capturing only the DATE part; optional wrappers
    return '(?:\\[\\[)?(' + inner + ')(?:\\]\\])?';
}

function dynamicInlineDateFieldRegex(key: string): RegExp {
    const value = buildConfiguredDateValueRegex();
    const inner = new RegExp(key.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + ':: *' + value);
    return toInlineFieldRegex(inner);
}

/**
 * A symbol map that corresponds to a task format that strives to be compatible with
 *   [Dataview]{@link https://github.com/blacksmithgu/obsidian-dataview}
 */
export const DATAVIEW_SYMBOLS = {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    prioritySymbols: {
        Highest: 'priority:: highest',
        High: 'priority:: high',
        Medium: 'priority:: medium',
        Low: 'priority:: low',
        Lowest: 'priority:: lowest',
        None: '',
    },
    startDateSymbol: 'start::',
    createdDateSymbol: 'created::',
    scheduledDateSymbol: 'scheduled::',
    dueDateSymbol: 'due::',
    doneDateSymbol: 'completion::',
    cancelledDateSymbol: 'cancelled::',
    recurrenceSymbol: 'repeat::',
    onCompletionSymbol: 'onCompletion::',
    idSymbol: 'id::',
    dependsOnSymbol: 'dependsOn::',
    TaskFormatRegularExpressions: () => ({
        priorityRegex: toInlineFieldRegex(/priority:: *(highest|high|medium|low|lowest)/),
        startDateRegex: dynamicInlineDateFieldRegex('start'),
        createdDateRegex: dynamicInlineDateFieldRegex('created'),
        scheduledDateRegex: dynamicInlineDateFieldRegex('scheduled'),
        dueDateRegex: dynamicInlineDateFieldRegex('due'),
        doneDateRegex: dynamicInlineDateFieldRegex('completion'),
        cancelledDateRegex: dynamicInlineDateFieldRegex('cancelled'),
        recurrenceRegex: toInlineFieldRegex(/repeat:: *([a-zA-Z0-9, !]+)/),
        onCompletionRegex: toInlineFieldRegex(/onCompletion:: *([a-zA-Z]+)/),
        dependsOnRegex: toInlineFieldRegex(new RegExp('dependsOn:: *(' + taskIdSequenceRegex.source + ')')),
        idRegex: toInlineFieldRegex(new RegExp('id:: *(' + taskIdRegex.source + ')')),
    }),
} as const;

/**
 * A {@link TaskSerializer} that that reads and writes tasks compatible with
 *   [Dataview]{@link https://github.com/blacksmithgu/obsidian-dataview}
 */
export class DataviewTaskSerializer extends DefaultTaskSerializer {
    constructor() {
        super(DATAVIEW_SYMBOLS);
    }

    protected parsePriority(p: string): Priority {
        return PriorityTools.priorityValue(p);
    }

    public componentToString(task: Task, shortMode: boolean, component: TaskLayoutComponent) {
        const stringComponent = super.componentToString(task, shortMode, component);
        const notInlineFieldComponents: TaskLayoutComponent[] = [
            TaskLayoutComponent.BlockLink,
            TaskLayoutComponent.Description,
        ];
        const shouldMakeInlineField = stringComponent !== '' && !notInlineFieldComponents.includes(component);
        return shouldMakeInlineField
            ? // Having 2 (TWO) leading spaces avoids a rendering issues that makes every other
              // square-bracketed inline-field invisible.
              // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1913
              `  [${stringComponent.trim()}]`
            : stringComponent;
    }
}
