import type { Settings } from '../Config/Settings';
import { DateParser } from '../Query/DateParser';
import { doAutocomplete } from '../DateAbbreviations';
import { Recurrence } from '../Recurrence';
import type { DefaultTaskSerializerSymbols } from '../TaskSerializer/DefaultTaskSerializer';
import { TaskRegularExpressions } from '../Task';
import type { SuggestInfo, SuggestionBuilder } from '.';

export function makeDefaultSuggestionBuilder(symbols: DefaultTaskSerializerSymbols): SuggestionBuilder {
    const datePrefixCharacters = `${symbols.startDateSymbol}${symbols.scheduledDateSymbol}${symbols.dueDateSymbol}`;
    /*
     * Return a list of suggestions, either generic or more fine-grained to the words at the cursor.
     */
    return (line: string, cursorPos: number, settings: Settings): SuggestInfo[] => {
        let suggestions: SuggestInfo[] = [];

        // Step 1: add date suggestions if relevant
        suggestions = suggestions.concat(addDatesSuggestions(line, cursorPos, settings, datePrefixCharacters));

        // Step 2: add recurrence suggestions if relevant
        suggestions = suggestions.concat(addRecurrenceSuggestions(line, cursorPos, settings, symbols.recurrenceSymbol));

        // Step 3: add more general suggestions ('due', 'recurrence' etc)
        const morePossibleSuggestions = getPossibleComponentSuggestions(line, settings, symbols);
        // We now filter the general suggestions according to the word at the cursor. If there's
        // something to match, we filter the suggestions accordingly, so the user can get more specific
        // results according to what she's typing.
        // If there's no good match, present the suggestions as they are
        const wordMatch = matchByPosition(line, /([a-zA-Z'_-]*)/g, cursorPos);
        let addedSuggestions = false;
        if (wordMatch && wordMatch.length > 0) {
            const wordUnderCursor = wordMatch[0];
            if (wordUnderCursor.length >= Math.max(1, settings.autoSuggestMinMatch)) {
                const filteredSuggestions = morePossibleSuggestions.filter((suggestInfo) =>
                    suggestInfo.displayText.toLowerCase().includes(wordUnderCursor.toLowerCase()),
                );
                for (const filtered of filteredSuggestions) {
                    suggestions.push({
                        suggestionType: 'match',
                        displayText: filtered.displayText,
                        appendText: filtered.appendText,
                        insertAt: wordMatch.index,
                        insertSkip: wordUnderCursor.length,
                    });
                    addedSuggestions = true;
                }
            }
        }
        // That's where we're adding all the suggestions in case there's nothing specific to match
        // (and we're allowed by the settings to bring back a zero-sized match)
        if (!addedSuggestions && settings.autoSuggestMinMatch === 0)
            suggestions = suggestions.concat(morePossibleSuggestions);

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
function getPossibleComponentSuggestions(
    line: string,
    _settings: Settings,
    symbols: DefaultTaskSerializerSymbols,
): SuggestInfo[] {
    const hasPriority = (line: string) =>
        Object.values(symbols.prioritySymbols).some((value) => value.length > 0 && line.includes(value));

    const suggestions: SuggestInfo[] = [];

    if (!line.includes(symbols.dueDateSymbol))
        suggestions.push({
            displayText: `${symbols.dueDateSymbol} due date`,
            appendText: `${symbols.dueDateSymbol} `,
        });
    if (!line.includes(symbols.startDateSymbol))
        suggestions.push({
            displayText: `${symbols.startDateSymbol} start date`,
            appendText: `${symbols.startDateSymbol} `,
        });
    if (!line.includes(symbols.scheduledDateSymbol))
        suggestions.push({
            displayText: `${symbols.scheduledDateSymbol} scheduled date`,
            appendText: `${symbols.scheduledDateSymbol} `,
        });
    if (!hasPriority(line)) {
        suggestions.push({
            displayText: `${symbols.prioritySymbols.High} high priority`,
            appendText: `${symbols.prioritySymbols.High} `,
        });
        suggestions.push({
            displayText: `${symbols.prioritySymbols.Medium} medium priority`,
            appendText: `${symbols.prioritySymbols.Medium} `,
        });
        suggestions.push({
            displayText: `${symbols.prioritySymbols.Low} low priority`,
            appendText: `${symbols.prioritySymbols.Low} `,
        });
    }
    if (!line.includes(symbols.recurrenceSymbol))
        suggestions.push({
            displayText: `${symbols.recurrenceSymbol} recurring (repeat)`,
            appendText: `${symbols.recurrenceSymbol} `,
        });

    return suggestions;
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
    datePrefixCharacters: string,
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
    const dateRegex = new RegExp(`([${datePrefixCharacters}])\\s*([0-9a-zA-Z ]*)`, 'ug');
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
        const maxGenericSuggestions = 5;
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
export function matchByPosition(s: string, r: RegExp, position: number): RegExpMatchArray {
    const matches = s.matchAll(r);
    for (const match of matches) {
        if (match?.index && match.index <= position && position <= match.index + match[0].length) return match;
    }
    return [];
}
