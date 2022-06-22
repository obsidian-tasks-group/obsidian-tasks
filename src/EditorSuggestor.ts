import {
    App,
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    TFile,
} from 'obsidian';

import type { Settings } from './Settings';

import * as task from './Task';
import { DateParser } from './Query/DateParser';
import { doAutocomplete } from './DateAbbreviations';
import { Recurrence } from './Recurrence';

const datePrefixCharacters = `${task.startDateSymbol}${task.scheduledDateSymbol}${task.dueDateSymbol}`;
const maxTotalSuggestions = 6;

/*
 * A suggestion presented to the user and some metadata about it.
 */
type SuggestInfo = {
    suggestionType?: 'match' | 'default' | 'empty';
    // What to display to the user
    displayText: string;
    // What to append to the note
    appendText: string;
    context: EditorSuggestContext;
    // At what index in the line to do the insertion (if not specified, the cursor location is used)
    insertAt?: number;
    // How many characters to skip from the original line (e.g. if replacing existing text)
    insertSkip?: number;
};

export class EditorSuggestor extends EditorSuggest<SuggestInfo> {
    private settings: Settings;

    constructor(app: App, settings: Settings) {
        super(app);
        this.settings = settings;
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        _file: TFile,
    ): EditorSuggestTriggerInfo | null {
        if (!this.settings.autoSuggestInEditor) return null;
        const line = editor.getLine(cursor.line);
        if (
            line.contains(this.settings.globalFilter) &&
            line.match(task.Task.taskRegex)
        ) {
            return {
                start: { line: cursor.line, ch: 0 },
                end: {
                    line: cursor.line,
                    ch: line.length,
                },
                query: line,
            };
        }
        return null;
    }

    /*
     * Return a list of suggestions, either generic or more fine-grained to the words at the cursor.
     */
    getSuggestions(context: EditorSuggestContext): SuggestInfo[] {
        const line = context.query;
        let suggestions: SuggestInfo[] = [];

        const currentCursor = context.editor.getCursor();

        // Step 1: add date suggestions if relevant
        suggestions = suggestions.concat(
            this.addDatesSuggestions(line, currentCursor.ch, context),
        );

        // Step 2: add recurrence suggestions if relevant
        suggestions = suggestions.concat(
            this.addRecurrenceSuggestions(line, currentCursor.ch, context),
        );

        // Step 3: add more general suggestions ('due', 'recurrence' etc)
        const morePossibleSuggestions = this.getPossibleComponentSuggestions(
            line,
            context,
        );
        // We now filter the general suggestions according to the word at the cursor. If there's
        // something to match, we filter the suggestions accordingly, so the user can get more specific
        // results according to what she's typing.
        // If there's no good match, present the suggestions as they are
        const wordMatch = matchByPosition(
            line,
            /([a-zA-Z'_-]*)/g,
            currentCursor.ch,
        );
        let addedSuggestions = false;
        if (wordMatch && wordMatch.length > 0) {
            const wordUnderCursor = wordMatch[0];
            const minMatch = 1;
            if (wordUnderCursor.length >= minMatch) {
                const filteredSuggestions = morePossibleSuggestions.filter(
                    (suggestInfo) =>
                        suggestInfo.displayText
                            .toLowerCase()
                            .includes(wordUnderCursor.toLowerCase()),
                );
                for (const filtered of filteredSuggestions) {
                    suggestions.push({
                        suggestionType: 'match',
                        displayText: filtered.displayText,
                        appendText: filtered.appendText,
                        context: filtered.context,
                        insertAt: wordMatch.index,
                        insertSkip: wordUnderCursor.length,
                    });
                    addedSuggestions = true;
                }
            }
        }
        // That's where we're adding all the suggestions in case there's nothing specific to match
        if (!addedSuggestions)
            suggestions = suggestions.concat(morePossibleSuggestions);

        // Unless we have a suggestion that is a match for something the user is currently typing, add
        // an 'Enter' entry in the beginning of the menu, so an Enter press will move to the next line
        // rather than insert a suggestion
        if (!suggestions.some((value) => value.suggestionType === 'match')) {
            // No actual match, only default ones
            suggestions.unshift({
                suggestionType: 'empty',
                displayText: '⏎',
                appendText: '\n',
                context: context,
            });
        }

        // Either way, after all the aggregations above, never suggest more than maxTotalSuggestions
        suggestions = suggestions.slice(0, maxTotalSuggestions);

        return suggestions;
    }

    renderSuggestion(value: SuggestInfo, el: HTMLElement) {
        el.setText(value.displayText);
    }

    selectSuggestion(value: SuggestInfo, _evt: MouseEvent | KeyboardEvent) {
        const editor = value.context.editor;
        if (value.suggestionType === 'empty') {
            // Close the suggestion dialog and simulate an Enter press to the editor
            this.close();
            const eventClone = new KeyboardEvent('keydown', {
                code: 'Enter',
                key: 'Enter',
            });
            (editor as any)?.cm?.contentDOM?.dispatchEvent(eventClone);
            return;
        }
        const currentCursor = value.context.editor.getCursor();
        const replaceFrom = {
            line: currentCursor.line,
            ch: value.insertAt ?? currentCursor.ch,
        };
        const replaceTo = value.insertSkip
            ? {
                  line: currentCursor.line,
                  ch: replaceFrom.ch + value.insertSkip,
              }
            : undefined;
        value.context.editor.replaceRange(
            value.appendText,
            replaceFrom,
            replaceTo,
        );
        value.context.editor.setCursor({
            line: currentCursor.line,
            ch: replaceFrom.ch + value.appendText.length,
        });
    }

    hasPriority(line: string) {
        if (
            Object.values(task.prioritySymbols).some(
                (value) => value.length > 0 && line.contains(value),
            )
        )
            return true;
    }

    /*
     * Get suggestions for generic task components, e.g. a priority or a 'due' symbol
     */
    getPossibleComponentSuggestions(
        line: string,
        context: EditorSuggestContext,
    ): SuggestInfo[] {
        const suggestions: SuggestInfo[] = [];

        if (!line.contains(task.dueDateSymbol))
            suggestions.push({
                displayText: `${task.dueDateSymbol} due date`,
                appendText: `${task.dueDateSymbol} `,
                context: context,
            });
        if (!line.contains(task.startDateSymbol))
            suggestions.push({
                displayText: `${task.startDateSymbol} start date`,
                appendText: `${task.startDateSymbol} `,
                context: context,
            });
        if (!line.contains(task.scheduledDateSymbol))
            suggestions.push({
                displayText: `${task.scheduledDateSymbol} scheduled date`,
                appendText: `${task.scheduledDateSymbol} `,
                context: context,
            });
        if (!this.hasPriority(line)) {
            suggestions.push({
                displayText: `${task.prioritySymbols.High} high priority`,
                appendText: `${task.prioritySymbols.High} `,
                context: context,
            });
            suggestions.push({
                displayText: `${task.prioritySymbols.Medium} medium priority`,
                appendText: `${task.prioritySymbols.Medium} `,
                context: context,
            });
            suggestions.push({
                displayText: `${task.prioritySymbols.Low} low priority`,
                appendText: `${task.prioritySymbols.Low} `,
                context: context,
            });
            if (!line.contains(task.recurrenceSymbol))
                suggestions.push({
                    displayText: `${task.recurrenceSymbol} recurring (repeat)`,
                    appendText: `${task.recurrenceSymbol} `,
                    context: context,
                });
        }

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
    addDatesSuggestions(
        line: string,
        cursorPos: number,
        context: EditorSuggestContext,
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
        const dateRegex = new RegExp(
            `([${datePrefixCharacters}])\\s*([0-9a-zA-Z ]*)`,
            'ug',
        );
        const dateMatch = matchByPosition(line, dateRegex, cursorPos);
        if (dateMatch && dateMatch.length >= 2) {
            const datePrefix = dateMatch[1];
            const dateString = dateMatch[2];
            // Try to parse the entered text as a valid date.
            // We pass forwardDate=true to parseDate because we expect due, start and scheduled dates to
            // be in the future, i.e. if today is Sunday and the user typed "due <Enter> Saturday", she
            // most likely means Saturday *in the future* and not yesterday.
            const possibleDate =
                dateString && dateString.length > 1
                    ? DateParser.parseDate(doAutocomplete(dateString), true)
                    : null;
            if (possibleDate && possibleDate.isValid()) {
                // Seems like the text that the user typed can be parsed as a valid date.
                // Present its completed form as a 1st suggestion
                results.push({
                    displayText: `${possibleDate.format(task.Task.dateFormat)}`,
                    appendText: `${datePrefix} ${possibleDate.format(
                        task.Task.dateFormat,
                    )} `,
                    context: context,
                    insertAt: dateMatch.index,
                    insertSkip: dateMatch[0].length,
                });
            }

            // Now to generic predefined suggestions.
            // If we get a partial match with some of the suggestions (e.g. the user started typing "to"),
            // we use that for matches ("tomorrow", "today" etc).
            // Otherwise, we just display the list of suggestions, and either way, truncate them eventually to
            // a max number
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
                genericMatches = genericSuggestions.slice(
                    0,
                    maxGenericSuggestions,
                );
            }
            for (const match of genericMatches) {
                const parsedDate = DateParser.parseDate(match, true);
                const formattedDate = `${parsedDate.format(
                    task.Task.dateFormat,
                )}`;
                results.push({
                    suggestionType: 'match',
                    displayText: `${match} (${formattedDate})`,
                    appendText: `${datePrefix} ${formattedDate} `,
                    context: context,
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
    addRecurrenceSuggestions(
        line: string,
        cursorPos: number,
        context: EditorSuggestContext,
    ) {
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
        const recurrenceRegex = new RegExp(
            `(${task.recurrenceSymbol})\\s*([0-9a-zA-Z ]*)`,
            'ug',
        );
        const recurrenceMatch = matchByPosition(
            line,
            recurrenceRegex,
            cursorPos,
        );
        if (recurrenceMatch && recurrenceMatch.length >= 2) {
            const recurrencePrefix = recurrenceMatch[1];
            const recurrenceString = recurrenceMatch[2];
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
                        context: context,
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
            // a max number
            const minMatch = 1;
            const maxGenericDateSuggestions = 5;
            let genericMatches = genericSuggestions
                .filter(
                    (value) =>
                        recurrenceString &&
                        recurrenceString.length >= minMatch &&
                        value
                            .toLowerCase()
                            .includes(recurrenceString.toLowerCase()),
                )
                .slice(0, maxGenericDateSuggestions);
            if (genericMatches.length === 0) {
                // Do completely generic date suggestions
                genericMatches = genericSuggestions.slice(
                    0,
                    maxGenericDateSuggestions,
                );
            }
            for (const match of genericMatches) {
                results.push({
                    suggestionType: 'match',
                    displayText: `${match}`,
                    appendText: `${recurrencePrefix} ${match} `,
                    context: context,
                    insertAt: recurrenceMatch.index,
                    insertSkip: recurrenceMatch[0].length,
                });
            }
        }

        return results;
    }
}

/**
 * Matches a string with a regex according to a position (typically of a cursor).
 * Will return a result only if a match exists and the given position is part of it.
 */
export function matchByPosition(
    s: string,
    r: RegExp,
    position: number,
): RegExpMatchArray {
    const matches = s.matchAll(r);
    for (const match of matches) {
        if (
            match?.index &&
            match.index <= position &&
            position <= match.index + match[0].length
        )
            return match;
    }
    return [];
}
