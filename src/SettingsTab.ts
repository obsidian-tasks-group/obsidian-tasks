import { PluginSettingTab, Setting } from 'obsidian';

import type TasksPlugin from './main';
import { DateFormat, getSettings, updateSettings } from './Settings';

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

        containerEl.createEl('hr');
        containerEl.createEl('h3', { text: 'Global Filter' });
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

        containerEl.createEl('hr');
        containerEl.createEl('h3', { text: 'Dates' });
        containerEl.createEl('hr');
        containerEl.createEl('div', {
            cls: 'setting-item-description',
            text:
                'Changing any date settings will change the storage of future tasks only.\n' +
                'This means that all tasks currently in the vault will remain the same.\n' +
                'Tasks will still understand all your tasks with the old format.\n\n' +
                'When you toggle a tasks status, edit a task using the modal, or create a new task, it will be stored with the new format.',
        });
        containerEl.createEl('br');
        containerEl.createEl('div', {
            cls: 'setting-item-description',
            text: 'Tasks shown in preview mode or query results will immediately reflect the change (after a reload of obsidian).',
        });
        containerEl.createEl('br');
        containerEl.createEl('div', {
            cls: 'setting-item-description',
            text: 'Please note that the modal for "creating or editing" tasks does not support all date formats in its date inputs!',
        });

        new Setting(containerEl)
            .setName('Date format')
            .setDesc(
                'All dates (for example due and done dates) will be saved in this format.',
            )
            .addDropdown((dropDown) => {
                const settings = getSettings();

                dropDown
                    .addOption(
                        'YYYY-MM-DD',
                        'YYYY-MM-DD (for example 2021-10-15)',
                    )
                    .addOption('YYYYMMDD', 'YYYYMMDD (for example 20211015)')
                    .setValue(settings.dateFormat)
                    .onChange(async (value) => {
                        updateSettings({ dateFormat: value as DateFormat });

                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Store links as dates')
            .setDesc(
                'Enabling this surrounds dates (for example due and done dates) with [[]] when a task is saved.',
            )
            .addToggle((toggle) => {
                const settings = getSettings();

                toggle.setValue(settings.linkDates).onChange(async (value) => {
                    updateSettings({ linkDates: value });

                    await this.plugin.saveSettings();
                });
            });
    }
}
