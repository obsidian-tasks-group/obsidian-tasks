import { App, Editor, EditorSuggest, TFile } from 'obsidian';
import type { EditorPosition, EditorSuggestContext, EditorSuggestTriggerInfo } from 'obsidian';
import type TasksPlugin from 'main';
import { ensureTaskHasId } from '../Task/TaskDependency';
import { replaceTaskWithTasks } from '../Obsidian/File';
import { type Settings, getUserSelectedTaskFormat } from '../Config/Settings';
import { canSuggestForLine } from './Suggestor';
import type { SuggestInfo } from '.';

export type SuggestInfoWithContext = SuggestInfo & {
    context: EditorSuggestContext;
};

export class EditorSuggestor extends EditorSuggest<SuggestInfoWithContext> {
    private settings: Settings;
    private plugin: TasksPlugin;

    constructor(app: App, settings: Settings, plugin: TasksPlugin) {
        super(app);
        this.settings = settings;
        this.plugin = plugin;

        // EditorSuggestor swallows tabs while the suggestor popup is open
        // This is a hack to support indenting while popup is open
        app.scope.register([], 'Tab', () => {
            const editor = this.context?.editor;
            if (editor) {
                editor.exec('indentMore');
                // Returning false triggers preventDefault
                // Should prevent double indent if tabs start to get passed through
                return false;
            }
            return true;
        });
    }

    onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile): EditorSuggestTriggerInfo | null {
        if (!this.settings.autoSuggestInEditor) return null;
        const line = editor.getLine(cursor.line);
        if (canSuggestForLine(line, cursor, editor)) {
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
        const allTasks = this.plugin.getTasks();

        const taskToSuggestFor = allTasks.find(
            (task) => task.taskLocation.path == context.file.path && task.taskLocation.lineNumber == currentCursor.line,
        );

        const suggestions: SuggestInfo[] =
            getUserSelectedTaskFormat().buildSuggestions?.(
                line,
                currentCursor.ch,
                this.settings,
                allTasks,
                taskToSuggestFor,
            ) ?? [];

        // Add the editor context to all the suggestions
        return suggestions.map((s) => ({ ...s, context }));
    }

    renderSuggestion(value: SuggestInfoWithContext, el: HTMLElement) {
        el.setText(value.displayText);
    }

    async selectSuggestion(value: SuggestInfoWithContext, _evt: MouseEvent | KeyboardEvent) {
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

        if (value.taskItDependsOn != null) {
            const newTask = ensureTaskHasId(
                value.taskItDependsOn,
                this.plugin.getTasks().map((task) => task.id),
            );
            value.appendText += ` ${newTask.id}`;

            if (value.context.file.basename == newTask.filename) {
                // Avoid "Has Been Modifed Externally Error" and Replace Task in Editor Context
                console.log(value.taskItDependsOn.toFileLineString());
                const start = {
                    line: value.taskItDependsOn.lineNumber,
                    ch: 0,
                };
                const end = {
                    line: value.taskItDependsOn.lineNumber,
                    ch: value.taskItDependsOn.toFileLineString().length,
                };
                value.context.editor.replaceRange(newTask.toFileLineString(), start, end);
            } else {
                // Replace Task in File Context
                replaceTaskWithTasks({ originalTask: value.taskItDependsOn, newTasks: newTask });
            }
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
