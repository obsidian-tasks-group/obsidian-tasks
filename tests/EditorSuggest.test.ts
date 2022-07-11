/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings } from '../src/config/Settings';
import { buildSuggestions } from '../src/Suggestor/Suggestor';
import type { SuggestInfo } from '../src/Suggestor/Suggestor';

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

    it('show all suggested text', () => {
        // Arrange
        const originalSettings = getSettings();
        originalSettings.autoSuggestMaxItems = 200;
        const lines = [
            '- [ ] some task',
            '- [ ] some task 🔁 ',
            '- [ ] some task 📅 ',
            '- [ ] some task 🛫 ',
            '- [ ] some task ⏳ ',
        ];
        const allSuggestions: SuggestInfo[] = [];
        for (const line of lines) {
            const suggestions: SuggestInfo[] = buildSuggestions(
                line,
                19,
                originalSettings,
            );
            allSuggestions.push(...suggestions);
        }
        expect(allSuggestions).toMatchInlineSnapshot(`
            Array [
              Object {
                "appendText": "
            ",
                "displayText": "⏎",
                "suggestionType": "empty",
              },
              Object {
                "appendText": "📅 ",
                "displayText": "📅 due date",
              },
              Object {
                "appendText": "🛫 ",
                "displayText": "🛫 start date",
              },
              Object {
                "appendText": "⏳ ",
                "displayText": "⏳ scheduled date",
              },
              Object {
                "appendText": "⏫ ",
                "displayText": "⏫ high priority",
              },
              Object {
                "appendText": "🔼 ",
                "displayText": "🔼 medium priority",
              },
              Object {
                "appendText": "🔽 ",
                "displayText": "🔽 low priority",
              },
              Object {
                "appendText": "🔁 ",
                "displayText": "🔁 recurring (repeat)",
              },
              Object {
                "appendText": "🔁 every ",
                "displayText": "every",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every day ",
                "displayText": "every day",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week ",
                "displayText": "every week",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every month ",
                "displayText": "every month",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every month on the ",
                "displayText": "every month on the",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every year ",
                "displayText": "every year",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Sunday ",
                "displayText": "every week on Sunday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Monday ",
                "displayText": "every week on Monday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Tuesday ",
                "displayText": "every week on Tuesday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Wednesday ",
                "displayText": "every week on Wednesday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Thursday ",
                "displayText": "every week on Thursday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Friday ",
                "displayText": "every week on Friday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🔁 every week on Saturday ",
                "displayText": "every week on Saturday",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 ",
                "displayText": "📅 due date",
              },
              Object {
                "appendText": "🛫 ",
                "displayText": "🛫 start date",
              },
              Object {
                "appendText": "⏳ ",
                "displayText": "⏳ scheduled date",
              },
              Object {
                "appendText": "⏫ ",
                "displayText": "⏫ high priority",
              },
              Object {
                "appendText": "🔼 ",
                "displayText": "🔼 medium priority",
              },
              Object {
                "appendText": "🔽 ",
                "displayText": "🔽 low priority",
              },
              Object {
                "appendText": "📅 2022-07-11 ",
                "displayText": "today (2022-07-11)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-12 ",
                "displayText": "tomorrow (2022-07-12)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-17 ",
                "displayText": "Sunday (2022-07-17)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-18 ",
                "displayText": "Monday (2022-07-18)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-12 ",
                "displayText": "Tuesday (2022-07-12)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-13 ",
                "displayText": "Wednesday (2022-07-13)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-14 ",
                "displayText": "Thursday (2022-07-14)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-15 ",
                "displayText": "Friday (2022-07-15)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-16 ",
                "displayText": "Saturday (2022-07-16)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-07-18 ",
                "displayText": "next week (2022-07-18)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2022-08-11 ",
                "displayText": "next month (2022-08-11)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 2023-07-11 ",
                "displayText": "next year (2023-07-11)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 ",
                "displayText": "🛫 start date",
              },
              Object {
                "appendText": "⏳ ",
                "displayText": "⏳ scheduled date",
              },
              Object {
                "appendText": "⏫ ",
                "displayText": "⏫ high priority",
              },
              Object {
                "appendText": "🔼 ",
                "displayText": "🔼 medium priority",
              },
              Object {
                "appendText": "🔽 ",
                "displayText": "🔽 low priority",
              },
              Object {
                "appendText": "🔁 ",
                "displayText": "🔁 recurring (repeat)",
              },
              Object {
                "appendText": "🛫 2022-07-11 ",
                "displayText": "today (2022-07-11)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-12 ",
                "displayText": "tomorrow (2022-07-12)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-17 ",
                "displayText": "Sunday (2022-07-17)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-18 ",
                "displayText": "Monday (2022-07-18)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-12 ",
                "displayText": "Tuesday (2022-07-12)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-13 ",
                "displayText": "Wednesday (2022-07-13)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-14 ",
                "displayText": "Thursday (2022-07-14)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-15 ",
                "displayText": "Friday (2022-07-15)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-16 ",
                "displayText": "Saturday (2022-07-16)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-07-18 ",
                "displayText": "next week (2022-07-18)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2022-08-11 ",
                "displayText": "next month (2022-08-11)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "🛫 2023-07-11 ",
                "displayText": "next year (2023-07-11)",
                "insertAt": 16,
                "insertSkip": 3,
                "suggestionType": "match",
              },
              Object {
                "appendText": "📅 ",
                "displayText": "📅 due date",
              },
              Object {
                "appendText": "⏳ ",
                "displayText": "⏳ scheduled date",
              },
              Object {
                "appendText": "⏫ ",
                "displayText": "⏫ high priority",
              },
              Object {
                "appendText": "🔼 ",
                "displayText": "🔼 medium priority",
              },
              Object {
                "appendText": "🔽 ",
                "displayText": "🔽 low priority",
              },
              Object {
                "appendText": "🔁 ",
                "displayText": "🔁 recurring (repeat)",
              },
              Object {
                "appendText": "
            ",
                "displayText": "⏎",
                "suggestionType": "empty",
              },
              Object {
                "appendText": "📅 ",
                "displayText": "📅 due date",
              },
              Object {
                "appendText": "🛫 ",
                "displayText": "🛫 start date",
              },
              Object {
                "appendText": "⏫ ",
                "displayText": "⏫ high priority",
              },
              Object {
                "appendText": "🔼 ",
                "displayText": "🔼 medium priority",
              },
              Object {
                "appendText": "🔽 ",
                "displayText": "🔽 low priority",
              },
              Object {
                "appendText": "🔁 ",
                "displayText": "🔁 recurring (repeat)",
              },
            ]
        `);
    });
});
