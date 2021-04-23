import { Editor, MarkdownView, Plugin, View, Workspace } from 'obsidian';

import { Task } from './Task';

export class Commands {
    private readonly plugin: Plugin;

    private get workspace(): Workspace {
        return this.plugin.app.workspace;
    }

    constructor({ plugin }: { plugin: Plugin }) {
        this.plugin = plugin;

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle Done',
            checkCallback: (checking: boolean) => {
                if (checking) {
                    const markdownView = this.getActiveMarkdownView();
                    if (markdownView === null) {
                        return false;
                    }

                    const editor = this.getEditor();
                    if (editor === null) {
                        // If we are not in an editor, the command shouldn't be shown.
                        return false;
                    }

                    const currentLine = editor.getLine(editor.getCursor().line);

                    // We want to toggle any checklist item, task or not, as this command is
                    // supposed to replace the original checklist toggle command.
                    // So we do not need to check whether we can create a valid task from the line.
                    const isTasksLine = Task.taskRegex.test(currentLine);

                    return isTasksLine;
                }

                // We are certain we are in the editor on a tasks line due to the check above.
                const path = (this.workspace.activeLeaf.view as any)?.file
                    ?.path;
                if (path === undefined) {
                    return;
                }
                // We are certain we are in the editor on a tasks line due to the check above.
                const editor = this.getEditor();
                if (editor === null) {
                    return;
                }

                const cursorPosition = editor.getCursor();
                const lineNumber = cursorPosition.line;
                const line = editor.getLine(lineNumber);
                const task = Task.fromLine({
                    line,
                    path,
                    sectionStart: 0, // We don't need this to toggle it here in the editor.
                    sectionIndex: 0, // We don't need this to toggle it here in the editor.
                    precedingHeader: null, // We don't need this to toggle it here in the editor.
                });

                if (task === null) {
                    // If the task is null this means that we have a regular checklist item.
                    // As this command is supposed to replace the original command to toggle
                    // checklists, we must do a regular toggle here.
                    const regexMatch = line.match(Task.taskRegex);
                    if (regexMatch === null) {
                        // We cannot toggle if we do not match.
                        return;
                    }

                    const indentation = regexMatch[1];
                    const statusString = regexMatch[2].toLowerCase();
                    const description = regexMatch[3];
                    const rest = regexMatch[4];

                    const toggledStatusString =
                        statusString === ' ' ? 'x' : ' ';

                    const toggledLine = `${indentation}- [${toggledStatusString}] ${description}${rest}`;
                    editor.setLine(lineNumber, toggledLine);
                } else {
                    // Toggle a regular task.
                    const toggledTask = task.toggle();
                    editor.setLine(lineNumber, toggledTask.toFileLineString());
                }
            },
        });
    }

    private getActiveMarkdownView(): MarkdownView | null {
        if (this.workspace.activeLeaf === undefined) {
            return null;
        }

        const activeLeaf = this.workspace.activeLeaf;
        if (!(activeLeaf.view instanceof MarkdownView)) {
            return null;
        }

        return activeLeaf.view;
    }

    private getEditor(): Editor | null {
        const view: View = this.workspace.activeLeaf.view;
        if (view instanceof MarkdownView) {
            return view.editor;
        } else {
            return null;
        }
    }
}
