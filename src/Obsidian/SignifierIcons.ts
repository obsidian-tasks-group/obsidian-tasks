import { GlobalFilter } from '../Config/GlobalFilter';
import type { AllTaskDateFields } from '../DateTime/DateFieldTypes';
import { PriorityTools } from '../lib/PriorityTools';
import { Priority } from '../Task/Priority';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import { DEFAULT_SYMBOLS, DefaultTaskSerializer } from '../TaskSerializer/DefaultTaskSerializer';
import { DataviewTaskSerializer } from '../TaskSerializer/DataviewTaskSerializer';
import { TasksIcon, iconForPriority, labelForPriority } from '../ui/Icons';

/**
 * A task property within a line (offsets from the start of the line), and how to show it in Live Preview.
 */
export interface SignifierRange {
    from: number;
    to: number;
    iconId: string;
    label: string;
    emoji: string;
    /** Any value to show after the icon or emoji, such as a date. */
    text: string;
}

const priorityEmojis: Record<Priority, string> = {
    [Priority.Highest]: DEFAULT_SYMBOLS.prioritySymbols.Highest,
    [Priority.High]: DEFAULT_SYMBOLS.prioritySymbols.High,
    [Priority.Medium]: DEFAULT_SYMBOLS.prioritySymbols.Medium,
    [Priority.None]: DEFAULT_SYMBOLS.prioritySymbols.None,
    [Priority.Low]: DEFAULT_SYMBOLS.prioritySymbols.Low,
    [Priority.Lowest]: DEFAULT_SYMBOLS.prioritySymbols.Lowest,
};

// NEW_TASK_FIELD_EDIT_REQUIRED
const signifiers: { symbols: string[]; iconId: string; label: string }[] = [
    { symbols: [DEFAULT_SYMBOLS.dueDateSymbol, '📆', '🗓'], iconId: TasksIcon.dueDate, label: 'Due' },
    { symbols: [DEFAULT_SYMBOLS.scheduledDateSymbol, '⌛'], iconId: TasksIcon.scheduledDate, label: 'Scheduled' },
    { symbols: [DEFAULT_SYMBOLS.startDateSymbol], iconId: TasksIcon.startDate, label: 'Start' },
    { symbols: [DEFAULT_SYMBOLS.createdDateSymbol], iconId: TasksIcon.createdDate, label: 'Created' },
    { symbols: [DEFAULT_SYMBOLS.doneDateSymbol], iconId: TasksIcon.doneDate, label: 'Done' },
    { symbols: [DEFAULT_SYMBOLS.cancelledDateSymbol], iconId: TasksIcon.cancelledDate, label: 'Cancelled' },
    { symbols: [DEFAULT_SYMBOLS.recurrenceSymbol], iconId: TasksIcon.recurrence, label: 'Recurs' },
    { symbols: [DEFAULT_SYMBOLS.onCompletionSymbol], iconId: TasksIcon.onCompletion, label: 'On completion' },
    { symbols: [DEFAULT_SYMBOLS.dependsOnSymbol], iconId: TasksIcon.dependsOn, label: 'Blocked by' },
    { symbols: [DEFAULT_SYMBOLS.idSymbol], iconId: TasksIcon.id, label: 'ID' },
    ...[Priority.Highest, Priority.High, Priority.Medium, Priority.Low, Priority.Lowest].map((priority) => ({
        symbols: [priorityEmojis[priority]],
        iconId: iconForPriority(priority)!,
        label: labelForPriority(priority),
    })),
];

const symbolToSignifier = new Map<string, { iconId: string; label: string }>();
for (const signifier of signifiers) {
    for (const symbol of signifier.symbols) {
        symbolToSignifier.set(symbol, { iconId: signifier.iconId, label: signifier.label });
    }
}

// Longest symbols first, so that the regex prefers the longest match:
const allSymbols = [...symbolToSignifier.keys()].sort((a, b) => b.length - a.length);
const escaped = allSymbols.map((symbol) => symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// A signifier must be at the start of the text or follow whitespace, as the Tasks parser requires.
const signifierRegex = new RegExp(`(^|\\s)(${escaped.join('|')})\\uFE0F?`, 'gu');

const emojiSerializer = new DefaultTaskSerializer(DEFAULT_SYMBOLS);
const dataviewSerializer = new DataviewTaskSerializer();

/**
 * If the line is a task (containing any global filter), return the offsets just after its checkbox,
 * and where its properties start, after the description. Properties are only read from the end of the line.
 */
function taskOffsets(
    line: string,
    serializer: DefaultTaskSerializer,
): { checkboxEnd: number; fieldsStart: number } | null {
    if (!TaskRegularExpressions.taskRegex.test(line)) {
        return null;
    }

    const globalFilter = GlobalFilter.getInstance();
    if (!globalFilter.isEmpty() && !globalFilter.includedIn(line)) {
        return null;
    }

    const checkboxEnd = line.indexOf(']') + 1;
    const body = line.substring(checkboxEnd);
    const { description } = serializer.deserialize(body.trim());
    // If the description cannot be found, for example because trailing tags were moved into it, search the whole body.
    const descriptionStart = description ? body.indexOf(description) : 0;
    const fieldsStart = descriptionStart === -1 ? checkboxEnd : checkboxEnd + descriptionStart + description.length;
    return { checkboxEnd, fieldsStart };
}

/**
 * Find the emoji signifiers in a task line, in the Tasks emoji format.
 */
export function findSignifierRanges(line: string): SignifierRange[] {
    const offsets = taskOffsets(line, emojiSerializer);
    if (offsets === null) {
        return [];
    }
    const { checkboxEnd, fieldsStart } = offsets;

    const ranges: SignifierRange[] = [];
    const body = line.substring(checkboxEnd);
    for (const match of body.matchAll(signifierRegex)) {
        const symbol = match[2];
        const signifier = symbolToSignifier.get(symbol)!;
        const from = checkboxEnd + match.index! + match[1].length;
        if (from < fieldsStart) {
            continue;
        }
        ranges.push({ from, to: from + match[0].length - match[1].length, ...signifier, emoji: symbol, text: '' });
    }
    return ranges;
}

// NEW_TASK_FIELD_EDIT_REQUIRED
const dataviewFields: Record<string, { iconId: string; label: string; emoji: string }> = {
    due: { iconId: TasksIcon.dueDate, label: 'Due', emoji: DEFAULT_SYMBOLS.dueDateSymbol },
    scheduled: { iconId: TasksIcon.scheduledDate, label: 'Scheduled', emoji: DEFAULT_SYMBOLS.scheduledDateSymbol },
    start: { iconId: TasksIcon.startDate, label: 'Start', emoji: DEFAULT_SYMBOLS.startDateSymbol },
    created: { iconId: TasksIcon.createdDate, label: 'Created', emoji: DEFAULT_SYMBOLS.createdDateSymbol },
    completion: { iconId: TasksIcon.doneDate, label: 'Done', emoji: DEFAULT_SYMBOLS.doneDateSymbol },
    cancelled: { iconId: TasksIcon.cancelledDate, label: 'Cancelled', emoji: DEFAULT_SYMBOLS.cancelledDateSymbol },
    repeat: { iconId: TasksIcon.recurrence, label: 'Recurs', emoji: DEFAULT_SYMBOLS.recurrenceSymbol },
    onCompletion: {
        iconId: TasksIcon.onCompletion,
        label: 'On completion',
        emoji: DEFAULT_SYMBOLS.onCompletionSymbol,
    },
    dependsOn: { iconId: TasksIcon.dependsOn, label: 'Blocked by', emoji: DEFAULT_SYMBOLS.dependsOnSymbol },
    id: { iconId: TasksIcon.id, label: 'ID', emoji: DEFAULT_SYMBOLS.idSymbol },
};

// An inline field, such as '[due:: 2026-10-01]' or '(priority:: high)'.
const dataviewFieldRegex = new RegExp(
    `([[(])\\s*(${['priority', ...Object.keys(dataviewFields)].join('|')})::\\s*([^\\])]*?)\\s*([\\])])`,
    'g',
);

/**
 * Find the Tasks properties written as Dataview inline fields in a task line, such as '[priority:: high]'.
 */
export function findDataviewFieldRanges(line: string): SignifierRange[] {
    const offsets = taskOffsets(line, dataviewSerializer);
    if (offsets === null) {
        return [];
    }
    const { checkboxEnd, fieldsStart } = offsets;

    const ranges: SignifierRange[] = [];
    const body = line.substring(checkboxEnd);
    for (const match of body.matchAll(dataviewFieldRegex)) {
        const [whole, open, key, value, close] = match;
        const bracketsMatch = (open === '[' && close === ']') || (open === '(' && close === ')');
        if (!bracketsMatch) {
            continue;
        }

        const from = checkboxEnd + match.index!;
        const to = from + whole.length;
        if (from < fieldsStart) {
            continue;
        }
        if (key === 'priority') {
            const priority = PriorityTools.priorityValue(value);
            if (priority === Priority.None) {
                continue;
            }
            ranges.push({
                from,
                to,
                iconId: iconForPriority(priority)!,
                label: labelForPriority(priority),
                emoji: priorityEmojis[priority],
                text: '',
            });
        } else if (value !== '') {
            ranges.push({ from, to, ...dataviewFields[key], text: value });
        }
    }
    return ranges;
}

/**
 * The task properties in a line to show compactly in Live Preview: emoji signifiers (only when
 * showing icons), or Dataview inline fields.
 */
export function propertyRangesForLine(
    line: string,
    taskFormat: string,
    signifierDisplay: 'icons' | 'emoji',
): SignifierRange[] {
    if (taskFormat === 'dataview') {
        return findDataviewFieldRanges(line);
    }
    return signifierDisplay === 'icons' ? findSignifierRanges(line) : [];
}

const dateFieldsByIconId: Record<string, AllTaskDateFields> = {
    [TasksIcon.createdDate]: 'createdDate',
    [TasksIcon.startDate]: 'startDate',
    [TasksIcon.scheduledDate]: 'scheduledDate',
    [TasksIcon.dueDate]: 'dueDate',
    [TasksIcon.doneDate]: 'doneDate',
    [TasksIcon.cancelledDate]: 'cancelledDate',
};

/**
 * The date field of a property, such as 'dueDate', or null if it is not a date.
 */
export function dateFieldOf(property: SignifierRange): AllTaskDateFields | null {
    return dateFieldsByIconId[property.iconId] ?? null;
}
