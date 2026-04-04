/* Interface describing the symbols that {@link DefaultTaskSerializer}
 * uses to serialize and deserialize tasks.
 *
 * @interface DefaultTaskSerializerSymbols
 */
export interface DefaultTaskSerializerSymbols {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    readonly prioritySymbols: {
        Highest: string;
        High: string;
        Medium: string;
        Low: string;
        Lowest: string;
        None: string;
    };
    readonly startDateSymbol: string;
    readonly createdDateSymbol: string;
    readonly scheduledDateSymbol: string;
    readonly dueDateSymbol: string;
    readonly doneDateSymbol: string;
    readonly cancelledDateSymbol: string;
    readonly recurrenceSymbol: string;
    readonly onCompletionSymbol: string;
    readonly idSymbol: string;
    readonly dependsOnSymbol: string;
    readonly TaskFormatRegularExpressions: {
        priorityRegex: RegExp;
        startDateRegex: RegExp;
        createdDateRegex: RegExp;
        scheduledDateRegex: RegExp;
        dueDateRegex: RegExp;
        doneDateRegex: RegExp;
        cancelledDateRegex: RegExp;
        recurrenceRegex: RegExp;
        onCompletionRegex: RegExp;
        idRegex: RegExp;
        dependsOnRegex: RegExp;
    };
}

// The allowed characters in a single task id:
export const taskIdRegex = /[a-zA-Z0-9-_]+/;

// The allowed characters in a comma-separated sequence of task ids:
export const taskIdSequenceRegex = new RegExp(taskIdRegex.source + '( *, *' + taskIdRegex.source + ' *)*');

function dateFieldRegex(symbols: string) {
    return fieldRegex(symbols, '(\\d{4}-\\d{2}-\\d{2})');
}

function fieldRegex(symbols: string, valueRegexString: string) {
    // \uFE0F? allows an optional Variant Selector 16 on emojis.
    let source = symbols + '\uFE0F?';
    if (valueRegexString !== '') {
        source += ' *' + valueRegexString;
    }
    // The regexes end with `$` because they will be matched and
    // removed from the end until none are left.
    source += '$';
    // nosemgrep: detect-non-literal-regexp — constructed from internal regex source
    return new RegExp(source); // Remove the 'u' flag, to fix parsing on iPadOS/iOS 18.6 and 26 Public Beta 2
}

/**
 * A symbol map for obsidian-task's default task style.
 * Uses emojis to concisely convey meaning
 */
export const DEFAULT_SYMBOLS: DefaultTaskSerializerSymbols = {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    prioritySymbols: {
        Highest: '🔺',
        High: '⏫',
        Medium: '🔼',
        Low: '🔽',
        Lowest: '⏬',
        None: '',
    },
    startDateSymbol: '🛫',
    createdDateSymbol: '➕',
    scheduledDateSymbol: '⏳',
    dueDateSymbol: '📅',
    doneDateSymbol: '✅',
    cancelledDateSymbol: '❌',
    recurrenceSymbol: '🔁',
    onCompletionSymbol: '🏁',
    dependsOnSymbol: '⛔',
    idSymbol: '🆔',
    TaskFormatRegularExpressions: {
        priorityRegex: fieldRegex('(🔺|⏫|🔼|🔽|⏬)', ''),
        startDateRegex: dateFieldRegex('🛫'),
        createdDateRegex: dateFieldRegex('➕'),
        scheduledDateRegex: dateFieldRegex('(?:⏳|⌛)'),
        dueDateRegex: dateFieldRegex('(?:📅|📆|🗓)'),
        doneDateRegex: dateFieldRegex('✅'),
        cancelledDateRegex: dateFieldRegex('❌'),
        recurrenceRegex: fieldRegex('🔁', '([a-zA-Z0-9, !]+)'),
        onCompletionRegex: fieldRegex('🏁', '([a-zA-Z]+)'),
        dependsOnRegex: fieldRegex('⛔', '(' + taskIdSequenceRegex.source + ')'),
        idRegex: fieldRegex('🆔', '(' + taskIdRegex.source + ')'),
    },
} as const;

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
    const inlineFieldRegex = (
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
    // nosemgrep: detect-non-literal-regexp — constructed from internal regex sources
    return new RegExp(inlineFieldRegex, innerFieldRegex.flags);
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
    TaskFormatRegularExpressions: {
        priorityRegex: toInlineFieldRegex(/priority:: *(highest|high|medium|low|lowest)/),
        startDateRegex: toInlineFieldRegex(/start:: *(\d{4}-\d{2}-\d{2})/),
        createdDateRegex: toInlineFieldRegex(/created:: *(\d{4}-\d{2}-\d{2})/),
        scheduledDateRegex: toInlineFieldRegex(/scheduled:: *(\d{4}-\d{2}-\d{2})/),
        dueDateRegex: toInlineFieldRegex(/due:: *(\d{4}-\d{2}-\d{2})/),
        doneDateRegex: toInlineFieldRegex(/completion:: *(\d{4}-\d{2}-\d{2})/),
        cancelledDateRegex: toInlineFieldRegex(/cancelled:: *(\d{4}-\d{2}-\d{2})/),
        recurrenceRegex: toInlineFieldRegex(/repeat:: *([a-zA-Z0-9, !]+)/),
        onCompletionRegex: toInlineFieldRegex(/onCompletion:: *([a-zA-Z]+)/),
        dependsOnRegex: toInlineFieldRegex(new RegExp('dependsOn:: *(' + taskIdSequenceRegex.source + ')')),
        idRegex: toInlineFieldRegex(new RegExp('id:: *(' + taskIdRegex.source + ')')),
    },
} as const;
