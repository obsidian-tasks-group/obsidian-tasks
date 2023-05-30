/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import * as chrono from 'chrono-node';
import { getSettings } from '../../src/Config/Settings';
import type { SuggestInfo } from '../../src/Suggestor';
import { makeDefaultSuggestionBuilder } from '../../src/Suggestor/Suggestor';
import { DEFAULT_SYMBOLS } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { DATAVIEW_SYMBOLS } from '../../src/TaskSerializer/DataviewTaskSerializer';
import { MarkdownTable } from '../TestingTools/VerifyMarkdownTable';

window.moment = moment;

// Set predictable date for all tests in this file
const mockDate = new Date(moment('2022-07-11 15:00').valueOf());

const chronoSpy = jest
    .spyOn(chrono, 'parseDate')
    .mockImplementation((text, _, options) => chrono.en.casual.parseDate(text, mockDate, options)!);

afterAll(() => {
    chronoSpy.mockRestore();
});

const MAX_GENERIC_SUGGESTIONS_FOR_TESTS = 50;

describe.each([
    { name: 'emoji', symbols: DEFAULT_SYMBOLS },
    { name: 'dataview', symbols: DATAVIEW_SYMBOLS },
])("auto-complete with '$name' symbols", ({ symbols }) => {
    const buildSuggestions = makeDefaultSuggestionBuilder(symbols, MAX_GENERIC_SUGGESTIONS_FOR_TESTS);
    const {
        dueDateSymbol,
        scheduledDateSymbol,
        startDateSymbol,
        createdDateSymbol,
        recurrenceSymbol,
        prioritySymbols,
    } = symbols;
    it('offers basic completion options for an empty task', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = '- [ ] ';
        const suggestions: SuggestInfo[] = buildSuggestions(line, 5, originalSettings);
        expect(suggestions).toEqual([
            { suggestionType: 'empty', displayText: '⏎', appendText: '\n' },
            { displayText: `${dueDateSymbol} due date`, appendText: `${dueDateSymbol} ` },
            { displayText: `${startDateSymbol} start date`, appendText: `${startDateSymbol} ` },
            { displayText: `${scheduledDateSymbol} scheduled date`, appendText: `${scheduledDateSymbol} ` },
            { displayText: `${prioritySymbols.High} high priority`, appendText: `${prioritySymbols.High} ` },
            { displayText: `${prioritySymbols.Medium} medium priority`, appendText: `${prioritySymbols.Medium} ` },
        ]);
    });

    it('offers generic due date completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = `- [ ] some task ${dueDateSymbol}`;
        const suggestions: SuggestInfo[] = buildSuggestions(line, 17, originalSettings);
        expect(suggestions[0].displayText).toContain('today');
        expect(suggestions[1].displayText).toContain('tomorrow');
        expect(suggestions.length).toEqual(6);
    });

    it('offers specific due date completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = `- [ ] some task ${dueDateSymbol} to`;
        const suggestions: SuggestInfo[] = buildSuggestions(line, 20, originalSettings);
        expect(suggestions[0].displayText).toContain('today');
        expect(suggestions[1].displayText).toContain('tomorrow');
    });

    it('offers generic recurrence completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = `- [ ] some task ${recurrenceSymbol}`;
        const suggestions: SuggestInfo[] = buildSuggestions(line, 17, originalSettings);
        expect(suggestions[0].displayText).toEqual('every');
        expect(suggestions[1].displayText).toEqual('every day');
        expect(suggestions[2].displayText).toEqual('every week');
    });

    it('offers specific recurrence completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = `- [ ] some task ${recurrenceSymbol} every w`;
        const suggestions: SuggestInfo[] = buildSuggestions(line, 25, originalSettings);
        expect(suggestions[0].displayText).toEqual('every week');
        expect(suggestions[1].displayText).toEqual('every week on Sunday');
        expect(suggestions[2].displayText).toEqual('every week on Monday');
    });

    it('respects the minimal match setting', () => {
        // Arrange
        const originalSettings = getSettings();
        originalSettings.autoSuggestMinMatch = 2;
        let line = `- [ ] some task ${recurrenceSymbol} e`;
        let suggestions: SuggestInfo[] = buildSuggestions(line, 19, originalSettings);
        expect(suggestions.length).toEqual(0);
        line = `- [ ] some task ${recurrenceSymbol} ev`;
        suggestions = buildSuggestions(line, 20, originalSettings);
        expect(suggestions[0].displayText).toEqual('every');
        expect(suggestions[1].displayText).toEqual('every day');
    });

    it('matches created property suggestion when user types "created" but not "today"', () => {
        // Arrange
        const originalSettings = getSettings();
        let line = '- [ ] some task cr';
        let suggestions: SuggestInfo[] = buildSuggestions(line, 18, originalSettings);
        expect(suggestions[0].displayText).toEqual(`${createdDateSymbol} created today (2022-07-11)`);

        line = '- [ ] some task tod';
        suggestions = buildSuggestions(line, 19, originalSettings);
        expect(suggestions[0].suggestionType).toEqual('empty');
        expect(suggestions[0].displayText).not.toContain('created today');
    });

    it('show all suggested text', () => {
        const originalSettings = getSettings();
        originalSettings.autoSuggestMaxItems = 200;

        const lines = [
            '- [ ] some task',
            `- [ ] some task ${recurrenceSymbol} `,
            `- [ ] some task ${dueDateSymbol} `,
            `- [ ] some task ${scheduledDateSymbol} `,
            `- [ ] some task ${startDateSymbol} `,
        ];
        const markdownTable = new MarkdownTable(['suggestion', 'expansion']);
        for (const line of lines) {
            const suggestions: SuggestInfo[] = buildSuggestions(line, line.length - 1, originalSettings);
            for (const suggestion of suggestions) {
                // The 'new line' replacement adds a trailing space at the end of a line,
                // which causes auto-formatting to then make the test fail.
                // So we replace the 'new line' character with some fixed text,
                // that displays nicely when the output Markdown table is viewed.
                let replacementText = `${suggestion.appendText}`;
                if (replacementText === '\n') {
                    replacementText = '&lt;new line>';
                }
                markdownTable.addRowIfNew([suggestion.displayText, replacementText]);
            }
        }

        // For help if this test fails and you are new to Approval Tests, see:
        //    https://publish.obsidian.md/tasks-contributing/Testing/Approval+Tests
        markdownTable.verify();
    });
});
