import { App, Editor, EditorSuggest, TFile } from 'obsidian';
import type { EditorPosition, EditorSuggestContext, EditorSuggestTriggerInfo } from 'obsidian';

import type { Settings } from '../Config/Settings';
import * as task from '../Task';
import { buildSuggestions } from './Suggestor';
import type { SuggestInfo } from './Suggestor';

export type SuggestInfoWithContext = SuggestInfo & {
    context: EditorSuggestContext;
};

export class EditorSuggestor extends EditorSuggest<SuggestInfoWithContext> {
    private settings: Settings;

    constructor(app: App, settings: Settings) {
        super(app);
        this.settings = settings;
    }

    onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile): EditorSuggestTriggerInfo | null {
        if (!this.settings.autoSuggestInEditor) return null;
        const line = editor.getLine(cursor.line);
        if (line.contains(this.settings.globalFilter) && line.match(task.Task.taskRegex)) {
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

    getSuggestions(context: EditorSuggestContext): SuggestInfoWithContext[] {
        const line = context.query;
        const currentCursor = context.editor.getCursor();

        const suggestions: SuggestInfo[] = buildSuggestions(line, currentCursor.ch, this.settings);

        // Add the editor context to all the suggestions
        const suggestionsWithContext: SuggestInfoWithContext[] = [];
        for (const suggestion of suggestions) suggestionsWithContext.push({ ...suggestion, context: context });

        return suggestionsWithContext;
    }

    renderSuggestion(value: SuggestInfoWithContext, el: HTMLElement) {
        el.setText(value.displayText);
    }

    selectSuggestion(value: SuggestInfoWithContext, _evt: MouseEvent | KeyboardEvent) {
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
        value.context.editor.replaceRange(value.appendText, replaceFrom, replaceTo);
        value.context.editor.setCursor({
            line: currentCursor.line,
            ch: replaceFrom.ch + value.appendText.length,
        });
    }
}
