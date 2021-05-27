import { createOrEdit } from './CreateOrEdit';

import { toggleDone } from './ToggleDone';
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
                createOrEdit(checking, editor, view, this.app);
            },
        });

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle Done',
            editorCheckCallback: toggleDone,
        });
    }
}
