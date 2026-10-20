import type { App, Editor, TFile } from 'obsidian';
import type TasksPlugin from '../../src/main';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { EditorSuggestor } from '../../src/Suggestor/EditorSuggestorPopup';

describe('EditorSuggestor', () => {
    const app = { scope: { register: vi.fn() } } as unknown as App;
    const plugin = { getTasks: () => [] } as unknown as TasksPlugin;
    const file = { path: 'a.md' } as TFile;
    const cursor = { line: 0, ch: 0 };

    function makeEditor() {
        return { getLine: vi.fn(() => 'not a task') } as unknown as Editor;
    }

    afterEach(() => {
        resetSettings();
    });

    it('should stop suggesting when autoSuggestInEditor is turned off after construction', () => {
        updateSettings({ autoSuggestInEditor: true });
        const suggestor = new EditorSuggestor(app, plugin);
        const editor = makeEditor();

        updateSettings({ autoSuggestInEditor: false });

        expect(suggestor.onTrigger(cursor, editor, file)).toBeNull();
        expect(editor.getLine).not.toHaveBeenCalled();
    });

    it('should start suggesting when autoSuggestInEditor is turned on after construction', () => {
        updateSettings({ autoSuggestInEditor: false });
        const suggestor = new EditorSuggestor(app, plugin);
        const editor = makeEditor();

        updateSettings({ autoSuggestInEditor: true });

        // The line is not a task, so there are no suggestions, but the setting let it look at the line.
        expect(suggestor.onTrigger(cursor, editor, file)).toBeNull();
        expect(editor.getLine).toHaveBeenCalled();
    });
});
