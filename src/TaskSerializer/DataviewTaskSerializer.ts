import { DefaultTaskSerializer, type DefaultTaskSerializerSymbols } from './DefaultTaskSerializer';

/**
 * A symbol map that corresponds to a task format that strives to be compatible with
 *   [Dataview]{@link https://github.com/blacksmithgu/obsidian-dataview}
 */
export const DATAVIEW_SYMBOLS: DefaultTaskSerializerSymbols = {
    prioritySymbols: {
        High: 'priority:: high',
        Medium: 'priority:: medium',
        Low: 'priority:: low',
        None: '',
    },
    startDateSymbol: 'start::',
    createdDateSymbol: 'created::',
    scheduledDateSymbol: 'scheduled::',
    dueDateSymbol: 'due::',
    doneDateSymbol: 'completion::',
    recurrenceSymbol: 'repeat::',
    TaskFormatRegularExpressions: {
        priorityRegex: /(priority:: *(?:high|medium|low))/,
        startDateRegex: /start:: *(\d{4}-\d{2}-\d{2})$/,
        createdDateRegex: /created:: *(\d{4}-\d{2}-\d{2})$/,
        scheduledDateRegex: /scheduled:: *(\d{4}-\d{2}-\d{2})$/,
        dueDateRegex: /due:: *(\d{4}-\d{2}-\d{2})$/,
        doneDateRegex: /completion:: *(\d{4}-\d{2}-\d{2})$/,
        recurrenceRegex: /repeat:: ?([a-zA-Z0-9, !]+)$/i,
    },
} as const;

/**
 * A {@link TaskSerializer} that that reads and writes tasks compatible with
 *   [Dataview]{@link https://github.com/blacksmithgu/obsidian-dataview}
 */
export class DataviewTaskSerializer extends DefaultTaskSerializer {
    constructor() {
        super(DATAVIEW_SYMBOLS);
    }
}
