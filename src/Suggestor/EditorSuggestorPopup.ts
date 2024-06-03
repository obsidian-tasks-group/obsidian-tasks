import { App, Editor, EditorSuggest, MarkdownView, Notice, TFile, editorInfoField } from 'obsidian';
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

/**
 * @todo Unify this with {@link errorAndNotice} in File.ts
 * @param message
 */
function showError(message: string) {
    console.error(message);
    new Notice(message + '\n\nThis message has been written to the console.\n', 10000);
}

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

            if (value.taskItDependsOn !== newTask) {
                // The task being depended on must not have had an ID previously,
                // so we have to save its new ID field:
                if (value.context.file.path == newTask.path) {
                    // Avoid "Has Been Modified Externally Error" and Replace Task in Editor Context
                    const originalLine = value.taskItDependsOn.originalMarkdown;
                    const start = {
                        line: value.taskItDependsOn.lineNumber,
                        ch: 0,
                    };
                    const end = {
                        line: value.taskItDependsOn.lineNumber,
                        ch: originalLine.length,
                    };

                    // Safety check: before we overwrite content in the editor, make sure
                    //               it has the expected content.
                    // This might happen, for example, if the file had been edited and the
                    // file not yet saved, so that the Tasks Cache is temporarily out-of-date.
                    const markdownInEditor: string = value.context.editor.getRange(start, end);
                    if (markdownInEditor !== originalLine) {
                        const message = `Error adding new ID, due to mismatched data in Tasks memory and the editor:
task line in memory: '${value.taskItDependsOn.originalMarkdown}'

task line in editor: '${markdownInEditor}'

file: '${newTask.path}'
`;
                        showError(message);
                        return;
                    }

                    value.context.editor.replaceRange(newTask.toFileLineString(), start, end);
                } else {
                    // Replace Task in File Context
                    replaceTaskWithTasks({ originalTask: value.taskItDependsOn, newTasks: newTask });
                }
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

        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2872
        // We need to save the file being edited, in case a Task.id was just added
        // to another Task in this same file.
        // Otherwise, if the user types a comma to add another dependency,
        // the same task can be offered again, and if done in rapid succession,
        // multiple ID fields can be added to individual task lines.

        // @ts-expect-error: TS2339: Property cm does not exist on type Editor
        const markdownFileInfo = value.context.editor.cm.state.field(editorInfoField);
        if (markdownFileInfo instanceof MarkdownView) {
            await markdownFileInfo.save();
        } else {
            const message = `Failed to save "${value.context.file.path}" automatically.
Please save the file to ensure edits are retained.`;
            showError(message);
        }
    }
}
