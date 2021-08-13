import { PluginSettingTab, Setting } from 'obsidian';

import { getSettings, updateSettings } from './Settings';
import { Task } from './Task'
import type TasksPlugin from './main';

export class SettingsTab extends PluginSettingTab {
    private readonly plugin: TasksPlugin;

    constructor({ plugin }: { plugin: TasksPlugin }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
    }

    public display(): void {
        const { containerEl } = this;
        const settingsOnDisplay = getSettings();

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Tasks Settings' });
        containerEl.createEl('p', {
            cls: 'tasks-setting-important',
            text: 'Changing any settings requires a restart of obsidian.',
        });

        // textInput for filtering obsidian-tasks Tasks from ordinary checkboxes : string
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

        // checkbox for hiding global filter on Preview Mode : boolean
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

        containerEl.createEl('h3', { text: 'Custom Date Formatting' });

        // checkbox for locking custom date format : boolean
        let customDateFormattingSetting : Setting;
        const lockFormatSetting = new Setting(containerEl)
            .setName('Lock Custom Date Format:')
            .addToggle((toggle) => {
                toggle
                    .setValue(settingsOnDisplay.disableDateFormat)
                    .onChange(async (value) => {
                        customDateFormattingSetting.setDisabled(value)
                        updateSettings({ disableDateFormat: value });
                        await this.plugin.saveSettings();
                    });
            });
          lockFormatSetting.descEl.innerHTML= "<span style='color:red'>WARNING</span>: If you already have tasks with a different date format, you may need to manually edit their format, otherwise they won't register dates correctly. They may be considered part of the Task Description. If your format is not a valid string, or the date may be considered invalid."

        // dropdown for custom date format
        customDateFormattingSetting = new Setting(containerEl)
            .setName('Custom Date Format:')
            .setDesc('Default: YYYY-MM-DD')
            .addDropdown((dropdown) => {
                const settings = getSettings();
                const options = Task.customDateFormats.map(obj=>obj.format)
                options.forEach(option=>dropdown.addOption(option, option))
                dropdown
                    .setValue(settings.customDateFormat)
                    .onChange(async (value) => {
                        updateSettings({ customDateFormat: value });
                        await this.plugin.saveSettings();
                    });
            });
    }
}
