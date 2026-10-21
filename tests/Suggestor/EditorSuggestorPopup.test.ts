import moment from 'moment';
import { type App, type Editor, type EditorSuggestContext, MarkdownView } from 'obsidian';
import type TasksPlugin from '../../src/main';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { EditorSuggestor } from '../../src/Suggestor/EditorSuggestorPopup';
import { createTFile } from '../__mocks__/obsidian';

window.moment = moment;

// Settings changed after the suggestor is created must take effect without restarting Obsidian.
describe('EditorSuggestor responds to changed settings', () => {
    const line = '- [ ] my task ';
    const cursor = { line: 0, ch: line.length };
    const file = createTFile('a.md');

    function createSuggestor() {
        const app = { scope: { register: () => {} } } as unknown as App;
        const plugin = { getTasks: () => [] } as unknown as TasksPlugin;
        return new EditorSuggestor(app, plugin);
    }

    function createEditor() {
        return {
            getLine: () => line,
            getCursor: () => cursor,
            cm: { state: { field: () => Object.create(MarkdownView.prototype) } },
        } as unknown as Editor;
    }

    afterEach(() => {
        resetSettings();
    });

    it('should stop suggesting when auto-suggest is turned off', () => {
        updateSettings({ autoSuggestInEditor: true });
        const suggestor = createSuggestor();
        const editor = createEditor();
        expect(suggestor.onTrigger(cursor, editor, file)).not.toBeNull();

        updateSettings({ autoSuggestInEditor: false });

        expect(suggestor.onTrigger(cursor, editor, file)).toBeNull();
    });

    it('should use the changed maximum number of suggestions', () => {
        updateSettings({ autoSuggestMaxItems: 6 });
        const suggestor = createSuggestor();
        const editor = createEditor();
        const context = { editor, file, query: line } as unknown as EditorSuggestContext;
        expect(suggestor.getSuggestions(context)).toHaveLength(6);

        updateSettings({ autoSuggestMaxItems: 3 });

        expect(suggestor.getSuggestions(context)).toHaveLength(3);
    });
});
