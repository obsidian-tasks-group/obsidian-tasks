/**
 * Suggestion defaults extracted from DefaultSuggestionBuilder to break
 * circular dependencies between Config/Settings.ts and DefaultSuggestionBuilder.ts.
 *
 * Settings.ts imports the constant and onlySuggestIfBracketOpen from this file
 * instead of DefaultSuggestionBuilder.ts to avoid the transitive chain:
 * Settings -> DSB -> Occurrence -> Settings.
 *
 * This file must NOT import from Config/Settings.ts or any module that
 * transitively imports Settings (e.g., Task, Occurrence, DependencyHelpers).
 */

/**
 * Recommended default value to pass in to {@link makeDefaultSuggestionBuilder} maxGenericSuggestions parameter
 * for production code.
 */
export const DEFAULT_MAX_GENERIC_SUGGESTIONS = 5;

type SuggestInfo = {
    suggestionType?: 'match' | 'default' | 'empty';
    displayText: string;
    appendText: string;
    insertAt?: number;
    insertSkip?: number;
    textToMatch?: string;
    taskItDependsOn?: any;
};

type SuggestionSettings = {
    autoSuggestMinMatch: number;
    autoSuggestMaxItems: number;
};

type SuggestionBuilder = (
    line: string,
    cursorPos: number,
    settings: SuggestionSettings,
    allTasks: any[],
    canSaveEdits: boolean,
    taskToSuggestFor?: any,
) => SuggestInfo[];

/**
 * Checks whether _any_ of the bracket pairs in {@link brackets} is open at the end of the string {@link line}
 */
function isAnyBracketOpen(line: string, brackets: [opening_bracket: string, closing_bracket: string][]): boolean {
    if (brackets.length === 0) {
        return false;
    }

    const numOpeningBrackets = Object.fromEntries(brackets.map(([open, _]) => [open, 0]));
    const openingOf = Object.fromEntries(brackets.map(([open, close]) => [close, open]));

    for (const c of line) {
        if (c in numOpeningBrackets) {
            numOpeningBrackets[c]++;
        } else if (c in openingOf) {
            numOpeningBrackets[openingOf[c]] = Math.max(0, numOpeningBrackets[openingOf[c]] - 1);
        }
    }

    return Object.values(numOpeningBrackets).some((n) => n > 0);
}

/**
 * Given a SuggestionBuilder {@link fn}, returns a new SuggestionBuilder with identical behavior to {@link fn} except
 *     it only returns suggestions if there is an open bracket at the given cursor position.
 */
export function onlySuggestIfBracketOpen(fn: SuggestionBuilder, brackets: [string, string][]): SuggestionBuilder {
    return (line, cursorPos, settings, taskToSuggestFor, allTasks): SuggestInfo[] => {
        if (!isAnyBracketOpen(line.slice(0, cursorPos), brackets)) {
            return [];
        }
        return fn(line, cursorPos, settings, taskToSuggestFor, allTasks);
    };
}
