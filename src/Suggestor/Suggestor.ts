import type { Settings } from '../Config/Settings';
import { DateParser } from '../Query/DateParser';
import { doAutocomplete } from '../DateAbbreviations';
import { Recurrence } from '../Recurrence';
import type { DefaultTaskSerializerSymbols } from '../TaskSerializer/DefaultTaskSerializer';
import { Task, TaskRegularExpressions } from '../Task';
import { GlobalFilter } from '../Config/GlobalFilter';
import type { SuggestInfo, SuggestionBuilder } from '.';

/**
 * Recommended default value to pass in to {@link makeDefaultSuggestionBuilder} maxGenericSuggestions parameter
 * for production code.
 */
export const DEFAULT_MAX_GENERIC_SUGGESTIONS = 5;

export function makeDefaultSuggestionBuilder(
    symbols: DefaultTaskSerializerSymbols,
    maxGenericSuggestions: number /** See {@link DEFAULT_MAX_GENERIC_SUGGESTIONS} */,
): SuggestionBuilder {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    const datePrefixRegex = [symbols.startDateSymbol, symbols.scheduledDateSymbol, symbols.dueDateSymbol].join('|');
    /*
     * Return a list of suggestions, either generic or more fine-grained to the words at the cursor.
     */
    return (line: string, cursorPos: number, settings: Settings): SuggestInfo[] => {
        let suggestions: SuggestInfo[] = [];

        // Step 1: add date suggestions if relevant
        suggestions = suggestions.concat(
            addDatesSuggestions(line, cursorPos, settings, datePrefixRegex, maxGenericSuggestions),
        );

        // Step 2: add recurrence suggestions if relevant
        suggestions = suggestions.concat(addRecurrenceSuggestions(line, cursorPos, settings, symbols.recurrenceSymbol));

        // Step 3: add task property suggestions ('due', 'recurrence' etc)
        suggestions = suggestions.concat(addTaskPropertySuggestions(line, cursorPos, settings, symbols));

        // Unless we have a suggestion that is a match for something the user is currently typing, add
        // an 'Enter' entry in the beginning of the menu, so an Enter press will move to the next line
        // rather than insert a suggestion
        if (suggestions.length > 0 && !suggestions.some((value) => value.suggestionType === 'match')) {
            // No actual match, only default ones
            suggestions.unshift({
                suggestionType: 'empty',
                displayText: '⏎',
                appendText: '\n',
            });
        }

        // Either way, after all the aggregations above, never suggest more than the max items
        suggestions = suggestions.slice(0, settings.autoSuggestMaxItems);

        return suggestions;
    };
}

/*
 * Get suggestions for generic task components, e.g. a priority or a 'due' symbol
 */
function addTaskPropertySuggestions(
    line: string,
    cursorPos: number,
    _settings: Settings,
    symbols: DefaultTaskSerializerSymbols,
): SuggestInfo[] {
    const hasPriority = (line: string) =>
        Object.values(symbols.prioritySymbols).some((value) => value.length > 0 && line.includes(value));

    const genericSuggestions: SuggestInfo[] = [];

    // NEW_TASK_FIELD_EDIT_REQUIRED
    if (!line.includes(symbols.dueDateSymbol))
        genericSuggestions.push({
            displayText: `${symbols.dueDateSymbol} due date`,
            appendText: `${symbols.dueDateSymbol} `,
        });
    if (!line.includes(symbols.startDateSymbol))
        genericSuggestions.push({
            displayText: `${symbols.startDateSymbol} start date`,
            appendText: `${symbols.startDateSymbol} `,
        });
    if (!line.includes(symbols.scheduledDateSymbol))
        genericSuggestions.push({
            displayText: `${symbols.scheduledDateSymbol} scheduled date`,
            appendText: `${symbols.scheduledDateSymbol} `,
        });
    if (!hasPriority(line)) {
        genericSuggestions.push({
            displayText: `${symbols.prioritySymbols.High} high priority`,
            appendText: `${symbols.prioritySymbols.High} `,
        });
        genericSuggestions.push({
            displayText: `${symbols.prioritySymbols.Medium} medium priority`,
            appendText: `${symbols.prioritySymbols.Medium} `,
        });
        genericSuggestions.push({
            displayText: `${symbols.prioritySymbols.Low} low priority`,
            appendText: `${symbols.prioritySymbols.Low} `,
        });
        genericSuggestions.push({
            displayText: `${symbols.prioritySymbols.Highest} highest priority`,
            appendText: `${symbols.prioritySymbols.Highest} `,
        });
        genericSuggestions.push({
            displayText: `${symbols.prioritySymbols.Lowest} lowest priority`,
            appendText: `${symbols.prioritySymbols.Lowest} `,
        });
    }
    if (!line.includes(symbols.recurrenceSymbol))
        genericSuggestions.push({
            displayText: `${symbols.recurrenceSymbol} recurring (repeat)`,
            appendText: `${symbols.recurrenceSymbol} `,
        });
    if (!line.includes(symbols.createdDateSymbol)) {
        const parsedDate = DateParser.parseDate('today', true);
        const formattedDate = parsedDate.format(TaskRegularExpressions.dateFormat);
        genericSuggestions.push({
            // We don't want this to match when the user types "today"
            textToMatch: `${symbols.createdDateSymbol} created`,
            displayText: `${symbols.createdDateSymbol} created today (${formattedDate})`,
            appendText: `${symbols.createdDateSymbol} ${formattedDate} `,
        });
    }

    // We now filter the general suggestions according to the word at the cursor. If there's
    // something to match, we filter the suggestions accordingly, so the user can get more specific
    // results according to what she's typing.
    // If there's no good match, present the suggestions as they are
    const wordMatch = matchByPosition(line, /([a-zA-Z'_-]*)/g, cursorPos);
    const matchingSuggestions: SuggestInfo[] = [];
    if (wordMatch && wordMatch.length > 0) {
        const wordUnderCursor = wordMatch[0];
        if (wordUnderCursor.length >= Math.max(1, _settings.autoSuggestMinMatch)) {
            const filteredSuggestions = genericSuggestions.filter((suggestInfo) => {
                const textToMatch = suggestInfo.textToMatch || suggestInfo.displayText;
                return textToMatch.toLowerCase().includes(wordUnderCursor.toLowerCase());
            });
            for (const filtered of filteredSuggestions) {
                matchingSuggestions.push({
                    suggestionType: 'match',
                    displayText: filtered.displayText,
                    appendText: filtered.appendText,
                    insertAt: wordMatch.index,
                    insertSkip: wordUnderCursor.length,
                });
            }
        }
    }
    // That's where we're adding all the suggestions in case there's nothing specific to match
    // (and we're allowed by the settings to bring back a zero-sized match)
    if (matchingSuggestions.length === 0 && _settings.autoSuggestMinMatch === 0) return genericSuggestions;

    return matchingSuggestions;
}

/*
 * If the cursor is located in a section that should be followed by a date (due, start date or scheduled date),
 * suggest options for what to enter as a date.
 * This has two parts: either generic predefined suggestions, or a single suggestion that is a parsed result
 * of what the user is typing.
 * Generic predefined suggestions, in turn, also have two options: either filtered (if the user started typing
 * something where a date is expected) or unfiltered
 */
function addDatesSuggestions(
    line: string,
    cursorPos: number,
    settings: Settings,
    datePrefixRegex: string,
    maxGenericSuggestions: number,
): SuggestInfo[] {
    const genericSuggestions = [
        'today',
        'tomorrow',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'next week',
        'next month',
        'next year',
    ];

    const results: SuggestInfo[] = [];
    const dateRegex = new RegExp(`(${datePrefixRegex})\\s*([0-9a-zA-Z ]*)`, 'ug');
    const dateMatch = matchByPosition(line, dateRegex, cursorPos);
    if (dateMatch && dateMatch.length >= 2) {
        const datePrefix = dateMatch[1];
        const dateString = dateMatch[2];
        if (dateString.length < settings.autoSuggestMinMatch) {
            return [];
        }
        // Try to parse the entered text as a valid date.
        // We pass forwardDate=true to parseDate because we expect due, start and scheduled dates to
        // be in the future, i.e. if today is Sunday and the user typed "due <Enter> Saturday", she
        // most likely means Saturday *in the future* and not yesterday.
        const possibleDate =
            dateString && dateString.length > 1 ? DateParser.parseDate(doAutocomplete(dateString), true) : null;
        if (possibleDate && possibleDate.isValid()) {
            // Seems like the text that the user typed can be parsed as a valid date.
            // Present its completed form as a 1st suggestion
            results.push({
                displayText: `${possibleDate.format(TaskRegularExpressions.dateFormat)}`,
                appendText: `${datePrefix} ${possibleDate.format(TaskRegularExpressions.dateFormat)} `,
                insertAt: dateMatch.index,
                insertSkip: dateMatch[0].length,
            });
        }

        // Now to generic predefined suggestions.
        // If we get a partial match with some of the suggestions (e.g. the user started typing "to"),
        // we use that for matches ("tomorrow", "today" etc).
        // Otherwise, we just display the list of suggestions, and either way, truncate them eventually to
        // a max number. We want the max number to be around half the total allowed matches, to also allow
        // some global generic matches (e.g. task components) to find their way to the menu
        const minMatch = 1;
        let genericMatches = genericSuggestions
            .filter(
                (value) =>
                    dateString &&
                    dateString.length >= minMatch &&
                    value.toLowerCase().includes(dateString.toLowerCase()),
            )
            .slice(0, maxGenericSuggestions);
        if (genericMatches.length === 0) {
            // Do completely generic date suggestions
            genericMatches = genericSuggestions.slice(0, maxGenericSuggestions);
        }
        for (const match of genericMatches) {
            const parsedDate = DateParser.parseDate(match, true);
            const formattedDate = `${parsedDate.format(TaskRegularExpressions.dateFormat)}`;
            results.push({
                suggestionType: 'match',
                displayText: `${match} (${formattedDate})`,
                appendText: `${datePrefix} ${formattedDate} `,
                insertAt: dateMatch.index,
                insertSkip: dateMatch[0].length,
            });
        }
    }
    return results;
}

/*
 * If the cursor is located in a section that should be followed by a recurrence description, suggest options
 * for what to enter as a recurrence.
 * This has two parts: either generic predefined suggestions, or a single suggestion that is a parsed result
 * of what the user is typing.
 * Generic predefined suggestions, in turn, also have two options: either filtered (if the user started typing
 * something where a recurrence is expected) or unfiltered
 */
function addRecurrenceSuggestions(line: string, cursorPos: number, settings: Settings, recurrenceSymbol: string) {
    const genericSuggestions = [
        'every',
        'every day',
        'every week',
        'every month',
        'every month on the',
        'every year',
        'every week on Sunday',
        'every week on Monday',
        'every week on Tuesday',
        'every week on Wednesday',
        'every week on Thursday',
        'every week on Friday',
        'every week on Saturday',
    ];

    const results: SuggestInfo[] = [];
    const recurrenceRegex = new RegExp(`(${recurrenceSymbol})\\s*([0-9a-zA-Z ]*)`, 'ug');
    const recurrenceMatch = matchByPosition(line, recurrenceRegex, cursorPos);
    if (recurrenceMatch && recurrenceMatch.length >= 2) {
        const recurrencePrefix = recurrenceMatch[1];
        const recurrenceString = recurrenceMatch[2];
        if (recurrenceString.length < settings.autoSuggestMinMatch) return [];
        if (recurrenceString.length > 0) {
            // If the text matches a valid recurence description, present it as a 1st suggestion.
            // We also add a nice checkmark in this case to denote it's a complete valid recurrence description
            const parsedRecurrence = Recurrence.fromText({
                recurrenceRuleText: recurrenceString,
                startDate: null,
                scheduledDate: null,
                dueDate: null,
            })?.toText();
            if (parsedRecurrence) {
                const appendedText = `${recurrencePrefix} ${parsedRecurrence} `;
                results.push({
                    suggestionType: 'match',
                    displayText: `✅ ${parsedRecurrence}`,
                    appendText: appendedText,
                    insertAt: recurrenceMatch.index,
                    insertSkip: recurrenceMatch[0].length,
                });
                // If the full match includes a complete valid suggestion *ending with space*,
                // don't suggest anything. The user is trying to continue to type something that is likely
                // not related to recurrence. When she starts a new word, maybe the recurrence matches
                // will be relevant again
                if (recurrenceMatch[0] == appendedText) return [];
            }
        }

        // Now to generic predefined suggestions.
        // If we get a partial match with some of the suggestions (e.g. the user started typing "every d"),
        // we use that for matches ("every day").
        // Otherwise, we just display the list of suggestions, and either way, truncate them eventually to
        // a max number.
        // In the case of recurrence rules, the max number should be small enough to allow users to "escape"
        // the mode of writing a recurrence rule, i.e. we should leave enough space for component suggestions
        const minMatch = 1;
        const maxGenericDateSuggestions = settings.autoSuggestMaxItems / 2;
        let genericMatches = genericSuggestions
            .filter(
                (value) =>
                    recurrenceString &&
                    recurrenceString.length >= minMatch &&
                    value.toLowerCase().includes(recurrenceString.toLowerCase()),
            )
            .slice(0, maxGenericDateSuggestions);
        if (genericMatches.length === 0 && recurrenceString.trim().length === 0) {
            // We have no actual match so do completely generic recurrence suggestions, but not if
            // there *was* a text to match (because it means the user is actually typing something else)
            genericMatches = genericSuggestions.slice(0, maxGenericDateSuggestions);
        }
        for (const match of genericMatches) {
            results.push({
                suggestionType: 'match',
                displayText: `${match}`,
                appendText: `${recurrencePrefix} ${match} `,
                insertAt: recurrenceMatch.index,
                insertSkip: recurrenceMatch[0].length,
            });
        }
    }

    return results;
}

/**
 * Matches a string with a regex according to a position (typically of a cursor).
 * Will return a result only if a match exists and the given position is part of it.
 */
export function matchByPosition(s: string, r: RegExp, position: number): RegExpMatchArray | void {
    const matches = s.matchAll(r);
    for (const match of matches) {
        if (match?.index && match.index <= position && position <= match.index + match[0].length) return match;
    }
}

/**
 * Checks whether _any_ of the bracket pairs in {@link brackets} is open at the end of the string {@link line}
 *
 * @example
 *     isAnyBracketOpen("(hello world",   [['(', ')']]);             // true
 *     isAnyBracketOpen("[hello world",   [['[', ']']]);             // true
 *     isAnyBracketOpen("[hello world",   [['(', ')'], ['[', ']']]); // true
 *     isAnyBracketOpen("([hello world)", [['(', ')'], ['[', ']']])  // true
 *     isAnyBracketOpen("))))(",          [['(', ')']])              // true
 *     isAnyBracketOpen("(hello world)",  [['(', ')']]);             // false
 *     isAnyBracketOpen("(hello world)",  []);                       // false
 *
 * @param line - The line of text to scan
 * @param brackets - A list of tuples that defines bracket pairs.
 */
function isAnyBracketOpen(line: string, brackets: [opening_bracket: string, closing_bracket: string][]): boolean {
    if (brackets.length === 0) {
        return false;
    }

    // Maps an opening bracket to the number of open brackets of that type
    const numOpeningBrackets = Object.fromEntries(brackets.map(([open, _]) => [open, 0]));
    // Maps a closing bracket to an opening bracket
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
 *
 * @param fn - A suggestion builder to wrap
 * @param brackets - A list of tuples that defines bracket pairs.
 * @returns A {@link SuggestionBuilder} that returns:
 *   * `[]` if there are no open brackets at the given cursor position
 *   * {@link fn}`(line, cursorPos, settings)` otherwise
 */
export function onlySuggestIfBracketOpen(fn: SuggestionBuilder, brackets: [string, string][]): SuggestionBuilder {
    return (line, cursorPos, settings): SuggestInfo[] => {
        if (!isAnyBracketOpen(line.slice(0, cursorPos), brackets)) {
            return [];
        }
        return fn(line, cursorPos, settings);
    };
}

/**
 * Return true if the Auto-Suggest menu may be shown on the current line,
 * and false value otherwise.
 *
 * This checks for simple pre-conditions:
 *  - Is the global filter (if set) in the line?
 *  - Is the line a task line (with a checkbox)
 * @param line
 * @param cursorPosition - the cursor position, when 0 is presumed to mean 'at the start of the line'.
 *                          See 'ch' in https://docs.obsidian.md/Reference/TypeScript+API/EditorPosition/EditorPosition
 */
export function canSuggestForLine(line: string, cursorPosition: number) {
    return GlobalFilter.getInstance().includedIn(line) && cursorIsInTaskLineDescription(line, cursorPosition);
}

/**
 * Return true if:
 * - line is a task line, that is, it is a list item with a checkbox.
 * - the cursor is in a task line's description.
 *
 * Here, description includes any task signifiers, as well as the vanilla description.
 * @param line
 * @param cursorPosition
 */
function cursorIsInTaskLineDescription(line: string, cursorPosition: number) {
    if (line.length === 0) {
        return false;
    }

    const components = Task.extractTaskComponents(line);
    if (!components) {
        // It is not a task line, that is, it is not a list item with a checkbox:
        return false;
    }

    // Reconstruct the contents of the line, up to the space after the closing ']' in the checkbox:
    const beforeDescription = components.indentation + components.listMarker + ' [' + components.status.symbol + '] ';

    return cursorPosition >= beforeDescription.length;
}
