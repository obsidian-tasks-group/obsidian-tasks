import moment from 'moment';
import { getSettings } from '../../src/Config/Settings';
import { makeDefaultSuggestionBuilder } from '../../src/Suggestor/Suggestor';
import { suggestionDisplay } from '../../src/Suggestor/SuggestionDisplay';
import { DEFAULT_SYMBOLS } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { DATAVIEW_SYMBOLS } from '../../src/TaskSerializer/DataviewTaskSerializer';
import type { DefaultTaskSerializerSymbols } from '../../src/TaskSerializer/DefaultTaskSerializer';

window.moment = moment;

jest.mock('obsidian');

function displayedSuggestions(line: string, symbols: DefaultTaskSerializerSymbols, dataviewMode: boolean) {
    const buildSuggestions = makeDefaultSuggestionBuilder(symbols, 50, dataviewMode);
    const settings = { ...getSettings(), autoSuggestMaxItems: 50 };
    return buildSuggestions(line, line.length, settings, [], true).map((suggestion) => {
        const { iconId, text } = suggestionDisplay(suggestion, symbols);
        return { iconId, text, appendText: suggestion.appendText };
    });
}

describe('suggestionDisplay', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2022-07-11'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('shows emoji-format suggestions as icons and words, without changing the inserted text', () => {
        const suggestions = displayedSuggestions('- [ ] some task ', DEFAULT_SYMBOLS, false);

        expect(suggestions).toContainEqual({ iconId: 'corner-down-left', text: 'New line', appendText: '\n' });
        expect(suggestions).toContainEqual({ iconId: 'calendar', text: 'Due date', appendText: '📅 ' });
        expect(suggestions).toContainEqual({ iconId: 'repeat', text: 'Recurs', appendText: '🔁 ' });
        expect(suggestions).toContainEqual({
            iconId: 'tasks-fa-angle-up',
            text: 'High priority',
            appendText: '⏫ ',
        });
        expect(suggestions).toContainEqual({ iconId: 'lock', text: 'Blocked by', appendText: '⛔ ' });
        expect(suggestions).toContainEqual({
            iconId: 'plus-circle',
            text: 'Created today (2022-07-11)',
            appendText: '➕ 2022-07-11 ',
        });
        suggestions.forEach((suggestion) => expect(suggestion.text).not.toMatch(/[📅🔁⏫⛔➕⏎]/u));
    });

    it('shows a valid recurrence rule with a check mark icon', () => {
        const suggestions = displayedSuggestions('- [ ] some task 🔁 every week', DEFAULT_SYMBOLS, false);

        expect(suggestions[0]).toEqual({ iconId: 'check', text: 'every week', appendText: '🔁 every week ' });
    });

    it('shows Dataview-format suggestions as icons and words', () => {
        const suggestions = displayedSuggestions('- [ ] some task [', DATAVIEW_SYMBOLS, true);

        expect(suggestions).toContainEqual({ iconId: 'calendar', text: 'Due date', appendText: 'due:: ' });
        expect(suggestions).toContainEqual({
            iconId: 'tasks-fa-angles-up',
            text: 'Highest priority',
            appendText: 'priority:: highest] ',
        });
        expect(suggestions).toContainEqual({
            iconId: 'tasks-fa-angle-up',
            text: 'High priority',
            appendText: 'priority:: high] ',
        });
    });
});
