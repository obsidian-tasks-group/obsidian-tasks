import { Notice, PluginSettingTab, Setting } from 'obsidian';
import { Feature } from './Feature';
import type TasksPlugin from './main';
import {
    getSettings,
    isFeatureEnabled,
    toggleFeature,
    updateSettings,
} from './Settings';

export class SettingsTab extends PluginSettingTab {
    private readonly plugin: TasksPlugin;

    constructor({ plugin }: { plugin: TasksPlugin }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
    }

    public display(): void {
        const { containerEl } = this;
        const { status_types } = getSettings();

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

        /* -------------------------------------------------------------------------- */
        /*                       Settings for Custom Task Status                      */
        /* -------------------------------------------------------------------------- */

        containerEl.createEl('hr');
        containerEl.createEl('h3', { text: 'Tasks Status Types' });
        const customStatusIntro = containerEl.createEl('p', {
            text: 'If you want to have the tasks support additional statuses outside of the default ones add them here with the status indicator. ',
        });
        customStatusIntro.insertAdjacentHTML(
            'beforeend',
            'By default the following statuses are supported:\n' +
                '<ul>\n' +
                '<li><strong>- [ ] Todo</strong> - This has a {space} between the brackets. Will toggle to In Progress.</li>\n' +
                '<li><strong>- [/] In Progress</strong> - This has a {/} between the brackets. Will toggle to Done.</li>\n' +
                '<li><strong>- [x] Done</strong> - This has a {x} between the brackets. Will toggle to Todo.</li>\n' +
                '<li><strong>- [-] Cancelled</strong> - This has a {-} between the brackets. Will toggle to Todo.</li>\n' +
                '</ul>\n',
        );

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
                            // Check to see if they are adding in defaults and block. UI provides this information already.
                            if ([' ', 'x', '-', '/'].includes(new_symbol)) {
                                new Notice(
                                    `The symbol ${new_symbol} is already in use.`,
                                );
                                updateSettings({
                                    status_types: status_types,
                                });
                                await this.plugin.saveSettings();
                                // Force refresh
                                this.display();
                                return;
                            }

                            await this.updateStatusSetting(
                                status_types,
                                status_type,
                                0,
                                new_symbol,
                            );
                        });

                    return t;
                })
                .addText((text) => {
                    const t = text
                        .setPlaceholder('Status name')
                        .setValue(status_type[1])
                        .onChange(async (new_name) => {
                            await this.updateStatusSetting(
                                status_types,
                                status_type,
                                1,
                                new_name,
                            );
                        });
                    return t;
                })
                .addText((text) => {
                    const t = text
                        .setPlaceholder('Next status symbol')
                        .setValue(status_type[2])
                        .onChange(async (new_symbol) => {
                            await this.updateStatusSetting(
                                status_types,
                                status_type,
                                2,
                                new_symbol,
                            );
                        });

                    return t;
                });
        });

        containerEl.createEl('div');

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

        const addStatusesSupportedByMinimalTheme = new Setting(
            this.containerEl,
        ).addButton((button) => {
            button
                .setButtonText(
                    'Add all Status types supported by Minimal Theme',
                )
                .setCta()
                .onClick(async () => {
                    const minimalSupportedStatuses: Array<
                        [string, string, string]
                    > = [
                        ['>', 'Forwarded', 'x'],
                        ['<', 'Schedule', 'x'],
                        ['?', 'Question', 'x'],
                        ['/', 'Incomplete', 'x'],
                        ['!', 'Important', 'x'],
                        ['"', 'Quote', 'x'],
                        ['-', 'Canceled', 'x'],
                        ['*', 'Star', 'x'],
                        ['l', 'Location', 'x'],
                        ['i', 'Info', 'x'],
                        ['S', 'Amount/savings/money', 'x'],
                        ['I', 'Idea/lightbulb', 'x'],
                        ['f', 'Fire', 'x'],
                        ['k', 'Key', 'x'],
                        ['u', 'Up', 'x'],
                        ['d', 'Down', 'x'],
                        ['w', 'Win', 'x'],
                        ['p', 'Pros', 'x'],
                        ['c', 'Cons', 'x'],
                        ['b', 'Bookmark', 'x'],
                    ];

                    minimalSupportedStatuses.forEach((importedStatus) => {
                        console.log(importedStatus);
                        const hasStatus = status_types.find((element) => {
                            return (
                                element[0] == importedStatus[0] &&
                                element[1] == importedStatus[1] &&
                                element[2] == importedStatus[2]
                            );
                        });
                        if (!hasStatus) {
                            status_types.push(importedStatus);
                        } else {
                            new Notice(
                                `The status ${importedStatus[1]} (${importedStatus[0]}) is already added.`,
                            );
                        }
                    });

                    updateSettings({
                        status_types: status_types,
                    });
                    await this.plugin.saveSettings();
                    // Force refresh
                    this.display();
                });
        });
        addStatusesSupportedByMinimalTheme.infoEl.remove();

        containerEl.createEl('hr');
        containerEl.createEl('h3', { text: 'Documentation and Support' });
        const supportAndInfoDiv = containerEl.createEl('div');

        supportAndInfoDiv.insertAdjacentHTML(
            'beforeend',
            '<p>If you need help with this plugin, please check out the <a href="https://schemar.github.io/obsidian-tasks/">Tasks documentation</a>. Click on issues below if you find something that the documentation does not explain or if you find something now working as expected.</p>\n' +
                '<a href="https://github.com/schemar/obsidian-tasks/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/schemar/obsidian-tasks?style=for-the-badge"></a>\n' +
                '<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/schemar/obsidian-tasks?style=for-the-badge">\n' +
                '<img alt="GitHub all releases" src="https://img.shields.io/github/downloads/schemar/obsidian-tasks/total?style=for-the-badge">\n' +
                '',
        );

        containerEl.createEl('hr');
        containerEl.createEl('h3', {
            text: 'Optional or in development features',
        });
        const featureFlagEnablement = containerEl.createEl('div');

        featureFlagEnablement.insertAdjacentHTML(
            'beforeend',
            '<p>The following features are in development or optional, stability is indicated \n' +
                'next to the feature. While we try to make sure there is good test coverage and validation \n' +
                'for every change there is always a chance of bugs.\n' +
                '</p>',
        );
        Feature.values.forEach((feature) => {
            new Setting(containerEl)
                .setName(feature.displayName)
                .setDesc(feature.description + ' Is Stable? ' + feature.stable)
                .addToggle((toggle) => {
                    toggle
                        .setValue(isFeatureEnabled(feature.internalName))
                        .onChange(async (value) => {
                            const updatedFeatures = toggleFeature(
                                feature.internalName,
                                value,
                            );
                            updateSettings({ features: updatedFeatures });

                            await this.plugin.saveSettings();
                            // Force refresh
                            this.display();
                        });
                });
        });
    }

    private async updateStatusSetting(
        status_types: [string, string, string][],
        status_type: [string, string, string],
        valueIndex: number,
        newValue: string,
    ) {
        const index = status_types.findIndex((element) => {
            element[0] === status_type[0] &&
                element[1] === status_type[1] &&
                element[2] === status_type[2];
        });

        if (index > -1) {
            status_types[index][valueIndex] = newValue;
            updateSettings({
                status_types: status_types,
            });
            await this.plugin.saveSettings();
        }
    }
}
