import type { App, Editor, MarkdownFileInfo, MarkdownView, View } from 'obsidian';
import type TasksPlugin from '../main';
import { createOrEdit } from './CreateOrEdit';
import { toggleDone } from './ToggleDone';
import { deleteLine, moveLineToArchive, moveLineToListEnd, moveLineToLogList } from './OnCompletion';

export class Commands {
    private readonly plugin: TasksPlugin;

    private get app(): App {
        return this.plugin.app;
    }

    constructor({ plugin }: { plugin: TasksPlugin }) {
        this.plugin = plugin;

        plugin.addCommand({
            id: 'edit-task',
            name: 'Create or edit task',
            icon: 'pencil',
            editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                // TODO Need to explore what happens if a tasks code block is rendered before the Cache has been created.
                return createOrEdit(checking, editor, view as View, this.app, this.plugin.getTasks()!);
            },
        });

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle task done',
            icon: 'check-in-circle',
            editorCheckCallback: toggleDone,
        });

        plugin.addCommand({
            id: 'delete-line',
            name: 'Delete the current line',
            editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                // TODO Need to explore what happens if a tasks code block is rendered before the Cache has been created.
                return deleteLine(checking, editor, view as View);
            },
        });

        plugin.addCommand({
            id: 'archive-line',
            name: 'Move line to an Archive note',
            editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                return moveLineToArchive(checking, editor, view as View);
            },
        });

        plugin.addCommand({
            id: 'line-to-log-list',
            name: 'Move line to a log list within note',
            editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                return moveLineToListEnd(checking, editor, view as View);
            },
        });

        plugin.addCommand({
            id: 'line-to-list-end',
            name: 'Move line to the end of current list',
            editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                return moveLineToLogList(checking, editor, view as View);
            },
        });
    }
}
