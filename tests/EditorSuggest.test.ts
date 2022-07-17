/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings } from '../src/config/Settings';
import { buildSuggestions } from '../src/Suggestor/Suggestor';
import type { SuggestInfo } from '../src/Suggestor/Suggestor';

import * as task from '../src/Task';

window.moment = moment;

describe('auto-complete', () => {
    it('offers basic completion options for an empty task', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = '- [ ] ';
        const suggestions: SuggestInfo[] = buildSuggestions(
            line,
            5,
            originalSettings,
        );
        expect(suggestions).toEqual([
            { suggestionType: 'empty', displayText: '⏎', appendText: '\n' },
            { displayText: '📅 due date', appendText: '📅 ' },
            { displayText: '🛫 start date', appendText: '🛫 ' },
            { displayText: '⏳ scheduled date', appendText: '⏳ ' },
            { displayText: '⏫ high priority', appendText: '⏫ ' },
            { displayText: '🔼 medium priority', appendText: '🔼 ' },
        ]);
    });

    it('offers generic due date completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = '- [ ] some task 📅';
        const suggestions: SuggestInfo[] = buildSuggestions(
            line,
            17,
            originalSettings,
        );
        expect(suggestions[0].displayText).toContain('today');
        expect(suggestions[1].displayText).toContain('tomorrow');
        expect(suggestions.length).toEqual(6);
    });

    it('offers specific due date completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = '- [ ] some task 📅 to';
        const suggestions: SuggestInfo[] = buildSuggestions(
            line,
            20,
            originalSettings,
        );
        expect(suggestions[0].displayText).toContain('today');
        expect(suggestions[1].displayText).toContain('tomorrow');
    });

    it('offers generic recurrence completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = '- [ ] some task 🔁';
        const suggestions: SuggestInfo[] = buildSuggestions(
            line,
            17,
            originalSettings,
        );
        expect(suggestions[0].displayText).toEqual('every');
        expect(suggestions[1].displayText).toEqual('every day');
        expect(suggestions[2].displayText).toEqual('every week');
    });

    it('offers specific recurrence completions', () => {
        // Arrange
        const originalSettings = getSettings();
        const line = '- [ ] some task 🔁 every w';
        const suggestions: SuggestInfo[] = buildSuggestions(
            line,
            25,
            originalSettings,
        );
        expect(suggestions[0].displayText).toEqual('every week');
        expect(suggestions[1].displayText).toEqual('every week on Sunday');
        expect(suggestions[2].displayText).toEqual('every week on Monday');
    });

    it('respects the minimal match setting', () => {
        // Arrange
        const originalSettings = getSettings();
        originalSettings.autoSuggestMinMatch = 2;
        let line = '- [ ] some task 🔁 e';
        let suggestions: SuggestInfo[] = buildSuggestions(
            line,
            19,
            originalSettings,
        );
        expect(suggestions.length).toEqual(0);
        line = '- [ ] some task 🔁 ev';
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
            '- [ ] some task 🔁 ',
            `- [ ] some task ${task.dueDateSymbol} `,
            `- [ ] some task ${task.scheduledDateSymbol} `,
            `- [ ] some task ${task.startDateSymbol} `,
        ];
        const allSuggestions: string[] = [];
        for (const line of lines) {
            // allSuggestions.push(`| ${line} | |`);
            const suggestions: SuggestInfo[] = buildSuggestions(
                line,
                line.length - 1,
                originalSettings,
            );
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
            | 📅 due date | 📅  |
            | 🛫 start date | 🛫  |
            | ⏳ scheduled date | ⏳  |
            | ⏫ high priority | ⏫  |
            | 🔼 medium priority | 🔼  |
            | 🔽 low priority | 🔽  |
            | 🔁 recurring (repeat) | 🔁  |
            | every | 🔁 every  |
            | every day | 🔁 every day  |
            | every week | 🔁 every week  |
            | every month | 🔁 every month  |
            | every month on the | 🔁 every month on the  |
            | every year | 🔁 every year  |
            | every week on Sunday | 🔁 every week on Sunday  |
            | every week on Monday | 🔁 every week on Monday  |
            | every week on Tuesday | 🔁 every week on Tuesday  |
            | every week on Wednesday | 🔁 every week on Wednesday  |
            | every week on Thursday | 🔁 every week on Thursday  |
            | every week on Friday | 🔁 every week on Friday  |
            | every week on Saturday | 🔁 every week on Saturday  |
            | today (2022-07-11) | 📅 2022-07-11  |
            | tomorrow (2022-07-12) | 📅 2022-07-12  |
            | Sunday (2022-07-17) | 📅 2022-07-17  |
            | Monday (2022-07-18) | 📅 2022-07-18  |
            | Tuesday (2022-07-12) | 📅 2022-07-12  |
            | Wednesday (2022-07-13) | 📅 2022-07-13  |
            | Thursday (2022-07-14) | 📅 2022-07-14  |
            | Friday (2022-07-15) | 📅 2022-07-15  |
            | Saturday (2022-07-16) | 📅 2022-07-16  |
            | next week (2022-07-18) | 📅 2022-07-18  |
            | next month (2022-08-11) | 📅 2022-08-11  |
            | next year (2023-07-11) | 📅 2023-07-11  |
            | today (2022-07-11) | ⏳ 2022-07-11  |
            | tomorrow (2022-07-12) | ⏳ 2022-07-12  |
            | Sunday (2022-07-17) | ⏳ 2022-07-17  |
            | Monday (2022-07-18) | ⏳ 2022-07-18  |
            | Tuesday (2022-07-12) | ⏳ 2022-07-12  |
            | Wednesday (2022-07-13) | ⏳ 2022-07-13  |
            | Thursday (2022-07-14) | ⏳ 2022-07-14  |
            | Friday (2022-07-15) | ⏳ 2022-07-15  |
            | Saturday (2022-07-16) | ⏳ 2022-07-16  |
            | next week (2022-07-18) | ⏳ 2022-07-18  |
            | next month (2022-08-11) | ⏳ 2022-08-11  |
            | next year (2023-07-11) | ⏳ 2023-07-11  |
            | today (2022-07-11) | 🛫 2022-07-11  |
            | tomorrow (2022-07-12) | 🛫 2022-07-12  |
            | Sunday (2022-07-17) | 🛫 2022-07-17  |
            | Monday (2022-07-18) | 🛫 2022-07-18  |
            | Tuesday (2022-07-12) | 🛫 2022-07-12  |
            | Wednesday (2022-07-13) | 🛫 2022-07-13  |
            | Thursday (2022-07-14) | 🛫 2022-07-14  |
            | Friday (2022-07-15) | 🛫 2022-07-15  |
            | Saturday (2022-07-16) | 🛫 2022-07-16  |
            | next week (2022-07-18) | 🛫 2022-07-18  |
            | next month (2022-08-11) | 🛫 2022-08-11  |
            | next year (2023-07-11) | 🛫 2023-07-11  |
            "
        `);

        // todaySpy.mockClear();
    });
});
