import { Priority } from '../Task/Priority';
import { DEFAULT_SYMBOLS, type DefaultTaskSerializerSymbols } from '../TaskSerializer/DefaultTaskSerializer';
import { DATAVIEW_SYMBOLS } from '../TaskSerializer/DataviewTaskSerializer';
import { TasksIcon, iconForPriority, labelForPriority } from '../ui/Icons';
import type { SuggestInfo } from '.';

/**
 * An auto-suggest item shown with icons: an optional icon, then plain text.
 */
export interface SuggestionDisplay {
    iconId: string | null;
    text: string;
}

export function symbolsForTaskFormat(taskFormat: string): DefaultTaskSerializerSymbols {
    return taskFormat === 'dataview' ? DATAVIEW_SYMBOLS : DEFAULT_SYMBOLS;
}

function capitalise(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Replace the signifier at the start of a suggestion's display text, such as '📅 due date', with an icon.
 * The text inserted into the note is unchanged.
 */
export function suggestionDisplay(suggestion: SuggestInfo, symbols: DefaultTaskSerializerSymbols): SuggestionDisplay {
    const { displayText } = suggestion;

    if (suggestion.suggestionType === 'empty') {
        return { iconId: TasksIcon.newLine, text: 'New line' };
    }

    // A complete, valid recurrence rule:
    if (suggestion.suggestionType === 'match' && displayText.startsWith('✅ ')) {
        return { iconId: TasksIcon.valid, text: displayText.slice('✅ '.length) };
    }

    if (displayText === 'generate unique id') {
        return { iconId: TasksIcon.id, text: 'Generate unique ID' };
    }

    // Priorities - checked first, because in Dataview format their symbols contain spaces:
    const priorities: [string, Priority][] = [
        [symbols.prioritySymbols.Highest, Priority.Highest],
        [symbols.prioritySymbols.High, Priority.High],
        [symbols.prioritySymbols.Medium, Priority.Medium],
        [symbols.prioritySymbols.Low, Priority.Low],
        [symbols.prioritySymbols.Lowest, Priority.Lowest],
    ];
    // Longest first, so that 'priority:: highest' is not mistaken for 'priority:: high':
    priorities.sort((a, b) => b[0].length - a[0].length);
    for (const [symbol, priority] of priorities) {
        if (symbol && displayText.startsWith(symbol + ' ')) {
            return { iconId: iconForPriority(priority), text: labelForPriority(priority) };
        }
    }

    // NEW_TASK_FIELD_EDIT_REQUIRED
    const fields: [string, string][] = [
        [symbols.dueDateSymbol, TasksIcon.dueDate],
        [symbols.startDateSymbol, TasksIcon.startDate],
        [symbols.scheduledDateSymbol, TasksIcon.scheduledDate],
        [symbols.createdDateSymbol, TasksIcon.createdDate],
        [symbols.recurrenceSymbol, TasksIcon.recurrence],
        [symbols.idSymbol, TasksIcon.id],
        [symbols.dependsOnSymbol, TasksIcon.dependsOn],
        [symbols.onCompletionSymbol, TasksIcon.onCompletion],
    ];
    for (const [symbol, iconId] of fields) {
        if (displayText.startsWith(symbol + ' ')) {
            const text = displayText
                .slice(symbol.length + 1)
                .replace('recurring (repeat)', 'recurs')
                .replace('depends on id', 'blocked by');
            return { iconId, text: capitalise(text) };
        }
    }

    return { iconId: null, text: displayText };
}
