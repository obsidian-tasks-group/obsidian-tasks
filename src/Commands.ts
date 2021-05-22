import { MarkdownView } from 'obsidian';

import { Status, Task } from './Task';
import { TaskModal } from './TaskModal';
import type { App, Editor, Plugin, View } from 'obsidian';

export class Commands {
    private readonly plugin: Plugin;

    private get app(): App {
        return this.plugin.app;
    }

    constructor({ plugin }: { plugin: Plugin }) {
        this.plugin = plugin;

        plugin.addCommand({
            id: 'edit-task',
            name: 'Create or edit',
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: View,
            ) => {
                if (checking) {
                    return view instanceof MarkdownView;
                }

                if (!(view instanceof MarkdownView)) {
                    // Should never happen due to check above.
                    return;
                }

                const path = view.file?.path;
                if (path === undefined) {
                    return;
                }

                const cursorPosition = editor.getCursor();
                const lineNumber = cursorPosition.line;
                const line = editor.getLine(lineNumber);
                const task = this.taskFromLine({ line, path });

                const onSubmit = (updatedTasks: Task[]): void => {
                    const serialized = updatedTasks
                        .map((task: Task) => task.toFileLineString())
                        .join('\n');
                    editor.setLine(lineNumber, serialized);
                };

                // Need to create a new instance every time, as cursor/task can change.
                const taskModal = new TaskModal({
                    app: this.app,
                    task,
                    onSubmit,
                });
                taskModal.open();
            },
        });

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle Done',
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: View,
            ) => {
                if (checking) {
                    if (!(view instanceof MarkdownView)) {
                        // If we are not in a markdown view, the command shouldn't be shown.
                        return false;
                    }

                    const currentLine = editor.getLine(editor.getCursor().line);

                    // We want to toggle any checklist item, task or not, as this command is
                    // supposed to replace the original checklist toggle command.
                    // So we do not need to check whether we can create a valid task from the line.
                    const isTasksLine = Task.taskRegex.test(currentLine);

                    return isTasksLine;
                }

                if (!(view instanceof MarkdownView)) {
                    // Should never happen due to check above.
                    return;
                }

                // We are certain we are in the editor on a tasks line due to the check above.
                const path = view.file?.path;
                if (path === undefined) {
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
                    const toggledTasks = task.toggle();
                    const serialized = toggledTasks
                        .map((task: Task) => task.toFileLineString())
                        .join('\n');
                    editor.setLine(lineNumber, serialized);
                }

                // Put the cursor back where it was on the line.
                editor.setCursor(cursorPosition);
            },
        });
    }

    private taskFromLine({ line, path }: { line: string; path: string }): Task {
        const task = Task.fromLine({
            line,
            path,
            sectionStart: 0, // We don't need this to toggle it here in the editor.
            sectionIndex: 0, // We don't need this to toggle it here in the editor.
            precedingHeader: null, // We don't need this to toggle it here in the editor.
        });

        if (task !== null) {
            return task;
        }

        // If we are not on a line of a task, we take what we have.
        // The non-task line can still be a checklist, for example if it is lacking the global filter.
        const nonTaskRegex: RegExp = /^([\s\t]*)[-*]? *(\[(.)\])? *(.*)/u;
        const nonTaskMatch = line.match(nonTaskRegex);
        if (nonTaskMatch === null) {
            // Should never happen; everything in the regex is optional.
            console.error('Tasks: Cannot create task on line:', line);
            return new Task({
                status: Status.Todo,
                description: '',
                path,
                indentation: '',
                originalStatusCharacter: ' ',
                dueDate: null,
                doneDate: null,
                recurrenceRule: null,
                // We don't need the following fields to edit here in the editor.
                sectionStart: 0,
                sectionIndex: 0,
                precedingHeader: null,
            });
        }

        const indentation: string = nonTaskMatch[1];
        const statusString: string = nonTaskMatch[3] ?? ' ';
        const status = statusString === ' ' ? Status.Todo : Status.Done;
        const description: string = nonTaskMatch[4];

        return new Task({
            status,
            description,
            path,
            indentation,
            originalStatusCharacter: statusString,
            dueDate: null,
            doneDate: null,
            recurrenceRule: null,
            // We don't need the following fields to edit here in the editor.
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: null,
        });
    }
}
