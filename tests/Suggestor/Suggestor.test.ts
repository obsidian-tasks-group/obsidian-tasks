/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings } from '../../src/Config/Settings';
import type { SuggestInfo } from '../../src/Suggestor';
import { makeDefaultSuggestionBuilder } from '../../src/Suggestor/Suggestor';
import { DEFAULT_SYMBOLS } from '../../src/TaskSerializer/DefaultTaskSerializer';

window.moment = moment;

describe.each([{ name: 'emoji', symbols: DEFAULT_SYMBOLS }])("auto-complete with '$name' symbols", ({ symbols }) => {
    const buildSuggestions = makeDefaultSuggestionBuilder(symbols);
    const { dueDateSymbol, scheduledDateSymbol, startDateSymbol, recurrenceSymbol, prioritySymbols } = symbols;
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

    // Test disabled until I can figure out:
    // 1. how to set the date.
    // 2. how to set maxGenericSuggestions in Suggestor.ts to higher than 5.
    // See suggestions in https://github.com/obsidian-tasks-group/obsidian-tasks/issues/861#issuecomment-1180788860
    it.skip('show all suggested text', () => {
        // Arrange
        const originalSettings = getSettings();
        originalSettings.autoSuggestMaxItems = 200;

        // This does not change the date used in the suggestions below.
        // It was a failed attempt at allowing this test to be independent of date of the run.
        // const todaySpy = jest
        //     .spyOn(Date, 'now')
        //     .mockReturnValue(moment('2022-06-11').valueOf());

        const lines = [
            '- [ ] some task',
            `- [ ] some task ${recurrenceSymbol} `,
            `- [ ] some task ${dueDateSymbol} `,
            `- [ ] some task ${scheduledDateSymbol} `,
            `- [ ] some task ${startDateSymbol} `,
        ];
        const allSuggestions: string[] = [];
        for (const line of lines) {
            // allSuggestions.push(`| ${line} | |`);
            const suggestions: SuggestInfo[] = buildSuggestions(line, line.length - 1, originalSettings);
            for (const suggestion of suggestions) {
                // The 'new line' replacement adds a trailing space at the end of a line,
                // which causes auto-formatting to then make the test fail.
                // So we replace the 'new line' character with some fixed text.
                let replacementText = `${suggestion.appendText}`;
                if (replacementText === '\n') {
                    replacementText = '<new line>';
                }
                // Format for pasting in to a Markdown table:
                const suggestionAsText = `| ${suggestion.displayText} | ${replacementText} |`;
                if (!allSuggestions.includes(suggestionAsText)) {
                    allSuggestions.push(suggestionAsText);
                }
            }
        }

        // CAUTION: In obsidian, when using this feature on a 'Monday' expands to the execution date.
        // In these tests, it expands to the Next Monday.

        expect('\n' + allSuggestions.join('\n') + '\n').toMatchInlineSnapshot(`
            "
            | ⏎ | <new line> |
            | ${dueDateSymbol} due date | ${dueDateSymbol}  |
            | ${startDateSymbol} start date | ${startDateSymbol}  |
            | ${scheduledDateSymbol} scheduled date | ${scheduledDateSymbol}  |
            | ${prioritySymbols.High} high priority | ${prioritySymbols.High}  |
            | ${prioritySymbols.Medium} medium priority | ${prioritySymbols.Medium}  |
            | ${prioritySymbols.Low} low priority | ${prioritySymbols.Low}  |
            | ${recurrenceSymbol} recurring (repeat) | ${recurrenceSymbol}  |
            | every | ${recurrenceSymbol} every  |
            | every day | ${recurrenceSymbol} every day  |
            | every week | ${recurrenceSymbol} every week  |
            | every month | ${recurrenceSymbol} every month  |
            | every month on the | ${recurrenceSymbol} every month on the  |
            | every year | ${recurrenceSymbol} every year  |
            | every week on Sunday | ${recurrenceSymbol} every week on Sunday  |
            | every week on Monday | ${recurrenceSymbol} every week on Monday  |
            | every week on Tuesday | ${recurrenceSymbol} every week on Tuesday  |
            | every week on Wednesday | ${recurrenceSymbol} every week on Wednesday  |
            | every week on Thursday | ${recurrenceSymbol} every week on Thursday  |
            | every week on Friday | ${recurrenceSymbol} every week on Friday  |
            | every week on Saturday | ${recurrenceSymbol} every week on Saturday  |
            | today (2022-07-11) | ${dueDateSymbol} 2022-07-11  |
            | tomorrow (2022-07-12) | ${dueDateSymbol} 2022-07-12  |
            | Sunday (2022-07-17) | ${dueDateSymbol} 2022-07-17  |
            | Monday (2022-07-18) | ${dueDateSymbol} 2022-07-18  |
            | Tuesday (2022-07-12) | ${dueDateSymbol} 2022-07-12  |
            | Wednesday (2022-07-13) | ${dueDateSymbol} 2022-07-13  |
            | Thursday (2022-07-14) | ${dueDateSymbol} 2022-07-14  |
            | Friday (2022-07-15) | ${dueDateSymbol} 2022-07-15  |
            | Saturday (2022-07-16) | ${dueDateSymbol} 2022-07-16  |
            | next week (2022-07-18) | ${dueDateSymbol} 2022-07-18  |
            | next month (2022-08-11) | ${dueDateSymbol} 2022-08-11  |
            | next year (2023-07-11) | ${dueDateSymbol} 2023-07-11  |
            | today (2022-07-11) | ${scheduledDateSymbol} 2022-07-11  |
            | tomorrow (2022-07-12) | ${scheduledDateSymbol} 2022-07-12  |
            | Sunday (2022-07-17) | ${scheduledDateSymbol} 2022-07-17  |
            | Monday (2022-07-18) | ${scheduledDateSymbol} 2022-07-18  |
            | Tuesday (2022-07-12) | ${scheduledDateSymbol} 2022-07-12  |
            | Wednesday (2022-07-13) | ${scheduledDateSymbol} 2022-07-13  |
            | Thursday (2022-07-14) | ${scheduledDateSymbol} 2022-07-14  |
            | Friday (2022-07-15) | ${scheduledDateSymbol} 2022-07-15  |
            | Saturday (2022-07-16) | ${scheduledDateSymbol} 2022-07-16  |
            | next week (2022-07-18) | ${scheduledDateSymbol} 2022-07-18  |
            | next month (2022-08-11) | ${scheduledDateSymbol} 2022-08-11  |
            | next year (2023-07-11) | ${scheduledDateSymbol} 2023-07-11  |
            | today (2022-07-11) | ${startDateSymbol} 2022-07-11  |
            | tomorrow (2022-07-12) | ${startDateSymbol} 2022-07-12  |
            | Sunday (2022-07-17) | ${startDateSymbol} 2022-07-17  |
            | Monday (2022-07-18) | ${startDateSymbol} 2022-07-18  |
            | Tuesday (2022-07-12) | ${startDateSymbol} 2022-07-12  |
            | Wednesday (2022-07-13) | ${startDateSymbol} 2022-07-13  |
            | Thursday (2022-07-14) | ${startDateSymbol} 2022-07-14  |
            | Friday (2022-07-15) | ${startDateSymbol} 2022-07-15  |
            | Saturday (2022-07-16) | ${startDateSymbol} 2022-07-16  |
            | next week (2022-07-18) | ${startDateSymbol} 2022-07-18  |
            | next month (2022-08-11) | ${startDateSymbol} 2022-08-11  |
            | next year (2023-07-11) | ${startDateSymbol} 2023-07-11  |
            "
        `);

        // todaySpy.mockClear();
    });
});
