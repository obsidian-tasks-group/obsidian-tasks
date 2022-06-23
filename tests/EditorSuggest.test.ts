/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSettings } from '../src/config/Settings';
import { SuggestInfo, buildSuggestions } from '../src/Suggestor/Suggestor';

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
});
