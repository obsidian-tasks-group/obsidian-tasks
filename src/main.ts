import { Plugin } from 'obsidian';

import { Cache } from './Cache';
import { Commands } from './Commands';
import { TasksEvents } from './TasksEvents';
import { initializeFile } from './File';
import { InlineRenderer } from './InlineRenderer';
import { newLivePreviewExtension } from './LivePreviewExtension';
import { QueryRenderer } from './QueryRenderer';
import { getSettings, updateSettings } from './Config/Settings';
import { SettingsTab } from './Config/SettingsTab';
import { StatusRegistry } from './StatusRegistry';
import { logging } from './lib/logging';
import { EditorSuggestor } from './Suggestor/EditorSuggestorPopup';
import { StatusSettings } from './Config/StatusSettings';
import type { Task } from './Task';
import { tasksApiV1 } from './Api';

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;
    public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;

    get apiV1() {
        return tasksApiV1(app);
    }

    async onload() {
        logging.registerConsoleLogger();
        console.log('loading plugin "tasks"');

        await this.loadSettings();
        this.addSettingTab(new SettingsTab({ plugin: this }));

        initializeFile({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
            workspace: this.app.workspace,
        });

        // Load configured status types.
        await this.loadTaskStatuses();

        const events = new TasksEvents({ obsidianEvents: this.app.workspace });
        this.cache = new Cache({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
            events,
        });
        this.inlineRenderer = new InlineRenderer({ plugin: this });
        this.queryRenderer = new QueryRenderer({ plugin: this, events });

        this.registerEditorExtension(newLivePreviewExtension());
        this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings()));
        new Commands({ plugin: this });
    }

    async loadTaskStatuses() {
        const { statusSettings } = getSettings();
        StatusSettings.applyToStatusRegistry(statusSettings, StatusRegistry.getInstance());
    }

    onunload() {
        console.log('unloading plugin "tasks"');
        this.cache?.unload();
    }

    async loadSettings() {
        const newSettings = await this.loadData();
        updateSettings(newSettings);
        await this.loadTaskStatuses();
    }

    async saveSettings() {
        await this.saveData(getSettings());
    }

    public getTasks(): Task[] | undefined {
        return this.cache?.getTasks();
    }
}
