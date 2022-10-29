import { PluginSettingTab, Setting } from 'obsidian';
import type TasksPlugin from '../main';
import { getSettings, updateSettings } from './Settings';

export class SettingsTab extends PluginSettingTab {
    private readonly plugin: TasksPlugin;

    constructor({ plugin }: { plugin: TasksPlugin }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
    }

    public display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Tasks Settings' });
        containerEl.createEl('p', {
            cls: 'tasks-setting-important',
            text: 'Changing any settings requires a restart of obsidian.',
        });

        new Setting(containerEl)
            .setName('Global task filter')
            .setDesc('The global filter will be applied to all checklist items.')
            .addText((text) => {
                const settings = getSettings();

                text.setPlaceholder('#task')
                    .setValue(settings.globalFilter)
                    .onChange(async (value) => {
                        updateSettings({ globalFilter: value });

                        await this.plugin.saveSettings();
                    });
            });
        containerEl.createEl('div', {
            cls: 'setting-item-description',
            text:
                'The global filter will be applied to all checklist items to filter out "non-task" checklist items.\n' +
                'A checklist item must include the specified string in its description in order to be considered a task.\n' +
                'For example, if you set the global filter to `#task`, the Tasks plugin will only handle checklist items tagged with `#task`.\n' +
                'Other checklist items will remain normal checklist items and not appear in queries or get a done date set.\n' +
                'Leave empty if you want all checklist items from your vault to be tasks managed by this plugin.',
        });

        new Setting(containerEl)
            .setName('Remove global filter from description')
            .setDesc(
                'Enabling this removes the string that you set as global filter from the task description when displaying a task.',
            )
            .addToggle((toggle) => {
                const settings = getSettings();

                toggle.setValue(settings.removeGlobalFilter).onChange(async (value) => {
                    updateSettings({ removeGlobalFilter: value });

                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Set done date on every completed task')
            .setDesc('Enabling this will add a timestamp ✅ YYYY-MM-DD at the end when a task is toggled to done')
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.setDoneDate).onChange(async (value) => {
                    updateSettings({ setDoneDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Auto-suggest task content')
            .setDesc('Enabling this will open an intelligent suggest menu while typing inside a recognized task line.')
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.autoSuggestInEditor).onChange(async (value) => {
                    updateSettings({ autoSuggestInEditor: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Minimum match length for auto-suggest')
            .setDesc(
                'If higher than 0, auto-suggest will be triggered only when the beginning of any supported keywords is recognized.',
            )
            .addSlider((slider) => {
                const settings = getSettings();
                slider
                    .setLimits(0, 3, 1)
                    .setValue(settings.autoSuggestMinMatch)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMinMatch: value });
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Maximum number of auto-suggestions to show')
            .setDesc(
                'How many suggestions should be shown when an auto-suggest menu pops up (including the "⏎" option).',
            )
            .addSlider((slider) => {
                const settings = getSettings();
                slider
                    .setLimits(3, 12, 1)
                    .setValue(settings.autoSuggestMaxItems)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMaxItems: value });
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Use filename as date fallback')
            .setDesc('Automatically schedule tasks at the date contained in the filename if no other date is set.')
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.enableDateFallback).onChange(async (value) => {
                    updateSettings({ enableDateFallback: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Folders with date fallback')
            .setDesc('Leave empty if you want to use fallback everywhere, or enter a comma-separated list of folders.')
            .addText(async (input) => {
                const settings = getSettings();
                await this.plugin.saveSettings();
                input.setValue(SettingsTab.renderFolderArray(settings.dateFallbackFolders)).onChange(async (value) => {
                    const folders = SettingsTab.parseCommaSeparatedFolders(value);
                    updateSettings({ dateFallbackFolders: folders });
                    await this.plugin.saveSettings();
                });
            });
    }

    private static parseCommaSeparatedFolders(input: string): string[] {
        return (
            input
                // a limitation is that folder names may not contain commas
                .split(',')
                .map((folder) => folder.trim())
                // remove leading and trailing slashes
                .map((folder) => folder.replace(/^\/|\/$/g, ''))
                .filter((folder) => folder !== '')
        );
    }

    private static renderFolderArray(folders: string[]): string {
        return folders.join(',');
    }
}
