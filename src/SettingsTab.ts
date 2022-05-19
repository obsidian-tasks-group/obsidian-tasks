import { PluginSettingTab, Setting } from 'obsidian';
import type TasksPlugin from './main';
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

        containerEl.createEl('h3', { text: 'Tasks Status Types' });
        containerEl.createEl('p', {
            text: 'If you want to have the tasks support additional statuses outside of todo and done add them here with the status indicator.',
        });

        const { status_types } = getSettings();

        status_types.forEach((status_type) => {
            new Setting(this.containerEl)
                .addExtraButton((extra) => {
                    extra
                        .setIcon('cross')
                        .setTooltip('Delete')
                        .onClick(async () => {
                            const index = status_types.indexOf(status_type);
                            if (index > -1) {
                                status_types.splice(index, 1);
                                updateSettings({
                                    status_types: status_types,
                                });
                                await this.plugin.saveSettings();
                                // Force refresh
                                this.display();
                            }
                        });
                })
                .addText((text) => {
                    const t = text
                        .setPlaceholder('Status symbol')
                        .setValue(status_type[0])
                        .onChange(async (new_symbol) => {
                            const index = status_types.indexOf(status_type);
                            if (index > -1) {
                                status_types[index][0] = new_symbol;
                                updateSettings({
                                    status_types: status_types,
                                });
                                await this.plugin.saveSettings();
                            }
                        });

                    return t;
                })
                .addText((text) => {
                    const t = text
                        .setPlaceholder('Status name')
                        .setValue(status_type[1])
                        .onChange(async (new_name) => {
                            const index = status_types.indexOf(status_type);
                            if (index > -1) {
                                status_types[index][1] = new_name;
                                updateSettings({
                                    status_types: status_types,
                                });
                                await this.plugin.saveSettings();
                            }
                        });
                    return t;
                })
                .addText((text) => {
                    const t = text
                        .setPlaceholder('Next status symbol')
                        .setValue(status_type[2])
                        .onChange(async (new_symbol) => {
                            const index = status_types.indexOf(status_type);
                            if (index > -1) {
                                status_types[index][2] = new_symbol;
                                updateSettings({
                                    status_types: status_types,
                                });
                                await this.plugin.saveSettings();
                            }
                        });

                    return t;
                });
        });

        this.containerEl.createEl('div');

        const setting = new Setting(this.containerEl).addButton((button) => {
            button
                .setButtonText('Add New Task Status')
                .setCta()
                .onClick(async () => {
                    status_types.push(['', '', '']);
                    updateSettings({
                        status_types: status_types,
                    });
                    await this.plugin.saveSettings();
                    // Force refresh
                    this.display();
                });
        });
        setting.infoEl.remove();
    }
}
