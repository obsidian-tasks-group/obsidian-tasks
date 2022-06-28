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
            .setDesc(
                'The global filter will be applied to all checklist items.',
            )
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

                toggle
                    .setValue(settings.removeGlobalFilter)
                    .onChange(async (value) => {
                        updateSettings({ removeGlobalFilter: value });

                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Set done date on every completed task')
            .setDesc(
                'Enabling this will add a timestamp ✅ YYYY-MM-DD at the end when a task is toggled to done',
            )
            .addToggle((toogle) => {
                const settings = getSettings();
                toogle
                    .setValue(settings.setDoneDate)
                    .onChange(async (value) => {
                        updateSettings({ setDoneDate: value });
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Auto-suggest task content')
            .setDesc(
                'Enabling this will open an intelligent suggest window while typing inside a recognized task line',
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle
                    .setValue(settings.autoSuggestInEditor)
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestInEditor: value });
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Minimal match length for auto-suggest')
            .setDesc(
                'If higher than 0, an auto-suggest will be triggered only if the beginning of a relevant keyword will be recognized',
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
            .setName('Maximal number of auto-suggestions to shown')
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
    }
}
