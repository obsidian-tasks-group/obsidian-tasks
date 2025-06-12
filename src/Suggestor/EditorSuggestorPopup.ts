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
        this.onTriggerSuggestions = []; // Reset suggestions on each trigger
        if (!this.settings.autoSuggestInEditor) return null;
        if (!_file) return null;

        const line = editor.getLine(cursor.line);
        if (!canSuggestForLine(line, cursor, editor)) return null;

        const suggestions = this.grabSuggestions({
            line: line,
            cursorPosition: cursor.ch,
            file: _file,
            cursorLine: cursor.line,
            canSaveEdits: true, // Assume true in onTrigger context
        });
        this.onTriggerSuggestions = suggestions;

        console.debug('onTrigger built suggestions:\n', suggestions);

        if (suggestions.length === 0) return null;

        return {
            start: { line: cursor.line, ch: 0 },
            end: { line: cursor.line, ch: line.length },
            query: line,
        };
    }

    getSuggestions(context: EditorSuggestContext): SuggestInfoWithContext[] {
        if (!context.file) return [] as SuggestInfoWithContext[];

        const currentCursor = context.editor.getCursor();
        const markdownFileInfo = this.getMarkdownFileInfo(context);
        const canSaveEdits = this.canSaveEdits(markdownFileInfo);

        const suggestions = this.grabSuggestions({
            line: context.query,
            cursorPosition: currentCursor.ch,
            file: context.file,
            cursorLine: currentCursor.line,
            canSaveEdits: canSaveEdits,
        });

        if (this.deepEqual(this.onTriggerSuggestions, suggestions)) {
            console.debug(
                'suggestions match onTrigger() suggestions',
                '\nonTrigger() suggestions:',
                this.onTriggerSuggestions,
                '\ngetSuggestions() suggestions:',
                suggestions,
            );
        } else {
            console.warn(
                'suggestions in getSuggestions() differ from those in onTrigger()',
                '\nonTrigger() suggestions:',
                this.onTriggerSuggestions,
                '\ngetSuggestions() suggestions:',
                suggestions,
            );
        }

        return suggestions.map((suggestion) => ({ ...suggestion, context }));
    }

    /**
     * Shared logic for building suggestions based on cursor position and file context
     *
     * grabSuggestions is called in onTrigger and getSuggestions
     *  - onTrigger uses the length of the suggestions to determine if the suggestor
     *  should be opened
     *  - getSuggestions uses the suggestions to render the suggestor popup
     *
     * The parameters, passed to grabSuggestions, are obtained from different methods
     * in onTrigger and getSuggestions.
     *
     * For the functionality of the tasks plugin, it is important that onTrigger
     * returns true when there are suggestions.
     *
     * For the functionality of other plugins that use the EditorSuggestor,
     * it is important that onTrigger returns null when there are no suggestions.
     *
     * If the parameters passed to grabSuggestions are equivalent then it is
     * assumed that the suggestor will return the same suggestions in both cases.
     *
     */

    private grabSuggestions(params: {
        line: string;
        cursorPosition: number;
        file: TFile;
        cursorLine: number;
        canSaveEdits: boolean;
    }): SuggestInfo[] {
        const { line, cursorPosition, file, cursorLine, canSaveEdits } = params;

        const allTasks = this.plugin.getTasks();
        const taskToSuggestFor = allTasks.find(
            (task) => task.taskLocation.path === file.path && task.taskLocation.lineNumber === cursorLine,
        );

        const taskFormat = getUserSelectedTaskFormat();

        return taskFormat.buildSuggestions
            ? taskFormat.buildSuggestions(line, cursorPosition, this.settings, allTasks, canSaveEdits, taskToSuggestFor)
            : [];
    }

    // Check to see if the suggestions built in getSuggestions match those built in onTrigger
    private onTriggerSuggestions: any = [];
    private deepEqual(obj1: { [x: string]: any } | null, obj2: { [x: string]: any } | null): boolean {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        return keys1.every((key) => this.deepEqual(obj1[key], obj2[key]));
    }

    private getMarkdownFileInfo(context: EditorSuggestContext) {
        // @ts-expect-error: TS2339: Property cm does not exist on type Editor
        return context.editor.cm.state.field(editorInfoField);
    }

    private canSaveEdits(markdownFileInfo: any) {
        return markdownFileInfo instanceof MarkdownView;
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

        const markdownFileInfo = this.getMarkdownFileInfo(value.context);
        if (this.canSaveEdits(markdownFileInfo)) {
            await markdownFileInfo.save();
        }
    }
}
