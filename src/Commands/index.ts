import type { App, Editor, Plugin, View } from 'obsidian';

import { createOrEdit } from './CreateOrEdit';
//import { selectStatus } from './SelectStatus';

import { toggleDone } from './ToggleDone';

export class Commands {
    private readonly plugin: Plugin;

    private get app(): App {
        return this.plugin.app;
    }

    constructor({ plugin }: { plugin: Plugin }) {
        this.plugin = plugin;

        plugin.addCommand({
            id: 'edit-task',
            name: 'Create or edit task',
            icon: 'pencil',
            editorCheckCallback: (
                checking: boolean,
                editor: Editor,
                view: View,
            ) => {
                return createOrEdit(checking, editor, view, this.app);
            },
        });

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle task done',
            icon: 'check-in-circle',
            editorCheckCallback: toggleDone,
        });

        // plugin.addCommand({
        //     id: 'select-status-modal',
        //     name: 'Select Status',
        //     icon: 'check-in-circle',
        //     editorCheckCallback: selectStatus,
        // });
    }
}
