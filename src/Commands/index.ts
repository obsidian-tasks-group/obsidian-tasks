import type { App, Editor, MarkdownFileInfo, MarkdownView, View } from 'obsidian';
import type TasksPlugin from '../main';
import { createOrEdit } from './CreateOrEdit';

import { toggleDone } from './ToggleDone';

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
                // TODO The simplest fix is to change this to this.plugin.cache! - but a better one
                //      is to pass in the task list instead.
                // @ts-expect-error TS2345: Argument of type 'Cache | undefined' is not assignable to parameter of type 'Cache'.
                return createOrEdit(checking, editor, view as View, this.app, this.plugin.cache);
            },
        });

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle task done',
            icon: 'check-in-circle',
            editorCheckCallback: toggleDone,
        });
    }
}
