import type { App, Editor, MarkdownFileInfo, MarkdownView, TFile, View } from 'obsidian';
import type TasksPlugin from '../main';
import { createOrEdit } from './CreateOrEdit';

import { toggleDone } from './ToggleDone';
import { ensureQueryFileDefaultsInFrontmatter } from './AddQueryFileDefaultsProperties';

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
                return createOrEdit(checking, editor, view as View, this.app, this.plugin.getTasks());
            },
        });

        plugin.addCommand({
            id: 'toggle-done',
            name: 'Toggle task done',
            icon: 'check-in-circle',
            editorCheckCallback: toggleDone,
        });

        plugin.addCommand({
            id: 'add-query-file-defaults-properties',
            name: 'Add all Query File Defaults properties',
            icon: 'settings',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    return false;
                }
                if (activeFile.extension !== 'md') {
                    return false;
                }

                if (!checking) {
                    this.ensureQueryFileDefaultsFrontmatter(activeFile).catch(console.error);
                }
                return true;
            },
        });
    }

    async ensureQueryFileDefaultsFrontmatter(file: TFile): Promise<void> {
        const { app } = this;
        await ensureQueryFileDefaultsInFrontmatter(app, file);
    }
}
