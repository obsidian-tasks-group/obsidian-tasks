import { Plugin } from 'obsidian';
import { SettingsTab } from 'SettingsTab';

import { Cache } from './Cache';
import { Commands } from './Commands';
import { initializeFile } from './File';
import { InlineRenderer } from './InlineRenderer';
import { QueryRenderer } from './QueryRenderer';
import { getSettings, updateSettings } from './Settings';

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;

    async onload() {
        console.log('loading plugin "tasks"');

        await this.loadSettings();
        this.addSettingTab(new SettingsTab({ plugin: this }));

        initializeFile({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
        });

        this.cache = new Cache({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
        });
        new InlineRenderer({ plugin: this });
        new QueryRenderer({ plugin: this, cache: this.cache });
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
