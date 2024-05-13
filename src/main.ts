import { Plugin } from 'obsidian';

import type { Task } from 'Task/Task';
import { Cache } from './Obsidian/Cache';
import { Commands } from './Commands';
import { GlobalQuery } from './Config/GlobalQuery';
import { TasksEvents } from './Obsidian/TasksEvents';
import { initializeFile } from './Obsidian/File';
import { InlineRenderer } from './Obsidian/InlineRenderer';
import { newLivePreviewExtension } from './Obsidian/LivePreviewExtension';
import { QueryRenderer } from './Renderer/QueryRenderer';
import { getSettings, updateSettings } from './Config/Settings';
import { SettingsTab } from './Config/SettingsTab';
import { StatusRegistry } from './Statuses/StatusRegistry';
import { log, logging } from './lib/logging';
import { EditorSuggestor } from './Suggestor/EditorSuggestorPopup';
import { StatusSettings } from './Config/StatusSettings';
import { tasksApiV1 } from './Api';
import { GlobalFilter } from './Config/GlobalFilter';

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;
    public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;

    get apiV1() {
        return tasksApiV1(app);
    }

    async onload() {
        logging.registerConsoleLogger();
        log('info', `loading plugin "${this.manifest.name}" v${this.manifest.version}`);

        await this.loadSettings();

        // Configure logging.
        const { loggingOptions } = getSettings();
        logging.configure(loggingOptions);

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
        this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings(), this));
        new Commands({ plugin: this });
    }

    async loadTaskStatuses() {
        const { statusSettings } = getSettings();
        StatusSettings.applyToStatusRegistry(statusSettings, StatusRegistry.getInstance());
    }

    onunload() {
        log('info', `unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
        this.cache?.unload();
    }

    async loadSettings() {
        let newSettings = await this.loadData();
        updateSettings(newSettings);

        // Fetch the updated settings, in case the user has not yet edited the settings,
        // in which case newSettings is currently empty.
        newSettings = getSettings();
        GlobalFilter.getInstance().set(newSettings.globalFilter);
        GlobalFilter.getInstance().setRemoveGlobalFilter(newSettings.removeGlobalFilter);
        GlobalQuery.getInstance().set(newSettings.globalQuery);

        await this.loadTaskStatuses();
    }

    async saveSettings() {
        await this.saveData(getSettings());
    }

    public getTasks(): Task[] {
        if (this.cache === undefined) {
            return [] as Task[];
        } else {
            return this.cache.getTasks();
        }
    }
}
