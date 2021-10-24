import { Plugin } from 'obsidian';

import { Cache } from './Cache';
import { Commands } from './Commands';
import { Events } from './Events';
import { initializeFile } from './File';
import { InlineRenderer } from './InlineRenderer';
import { QueryRenderer } from './QueryRenderer';
import { getSettings, updateSettings } from './Settings';
import { SettingsTab } from './SettingsTab';

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;
    private inlineRenderer: InlineRenderer | undefined;
    private queryRenderer: QueryRenderer | undefined;

    async onload() {
        console.log('loading plugin "tasks"');

        await this.loadSettings();
        this.addSettingTab(new SettingsTab({ plugin: this }));

        initializeFile({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
        });

        const events = new Events({ obsidianEents: this.app.workspace });
        this.cache = new Cache({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
            events,
        });
        this.inlineRenderer = new InlineRenderer({ plugin: this });
        this.queryRenderer = new QueryRenderer({ plugin: this, events });
        new Commands({ plugin: this });
    }

    onunload() {
        console.log('unloading plugin "tasks"');
        this.cache?.unload();
    }

    async loadSettings() {
        const newSettings = await this.loadData();
        updateSettings(newSettings);
    }

    async saveSettings() {
        await this.saveData(getSettings());
    }
}
