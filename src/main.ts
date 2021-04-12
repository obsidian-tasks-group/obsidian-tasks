import { Plugin } from 'obsidian';

import { Obsidian } from './Obsidian';
import { Cache, Commands, Events, File, Render, Settings } from './Tasks';

const DEFAULT_SETTINGS: Settings = {};

export default class TasksPlugin extends Plugin {
    private settings: Settings | undefined = undefined;
    private obsidian: Obsidian | undefined = undefined;

    async onload() {
        console.log('loading plugin "tasks"');

        await this.loadSettings();

        this.obsidian = new Obsidian({ plugin: this });
        const cache = new Cache({ obsidian: this.obsidian });
        const file = new File({ obsidian: this.obsidian });
        new Events({
            file,
            obsidian: this.obsidian,
        });
        new Commands({ file, obsidian: this.obsidian });
        new Render({ cache, obsidian: this.obsidian });
    }

    onunload() {
        console.log('unloading plugin "tasks"');
        this.obsidian?.unload();
    }

    async loadSettings(): Promise<Settings> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        ) as Settings;

        return this.settings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
