import { Notice, PluginSettingTab, Setting, debounce } from 'obsidian';
import { Status, StatusConfiguration } from 'Status';
import type TasksPlugin from '../main';
import type { HeadingState } from './Settings';
import { getSettings, isFeatureEnabled, updateGeneralSetting, updateSettings } from './Settings';
import { StatusSettings } from './StatusSettings';
import settingsJson from './settingsConfiguration.json';

import { CustomStatusModal } from './CustomStatusModal';
import * as StatusSettingsHelpers from './StatusSettingsHelpers';

export class SettingsTab extends PluginSettingTab {
    // If the UI needs a more complex setting you can create a
    // custom function and specify it from the json file. It will
    // then be rendered instead of a normal checkbox or text box.
    customFunctions: { [K: string]: Function } = {
        insertTaskCoreStatusSettings: this.insertTaskCoreStatusSettings,
        insertTaskStatusSettings: this.insertTaskStatusSettings,
    };

    private readonly plugin: TasksPlugin;

    constructor({ plugin }: { plugin: TasksPlugin }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
    }

    private static createFragmentWithHTML = (html: string) =>
        createFragment((documentFragment) => (documentFragment.createDiv().innerHTML = html));

    public async saveSettings(update?: boolean): Promise<void> {
        await this.plugin.saveSettings();

        if (update) {
            this.display();
        }
    }

    public display(): void {
        const { containerEl } = this;

        containerEl.empty();
        this.containerEl.addClass('tasks-settings');

        // For reasons I don't understand, 'h2' is tiny in Settings,
        // so I have used 'h3' as the largest heading.
        containerEl.createEl('h3', { text: 'Tasks Settings' });
        containerEl.createEl('p', {
            cls: 'tasks-setting-important',
            text: 'Changing any settings requires a restart of obsidian.',
        });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Global filter Settings' });
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName('Global task filter')
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    '<p><b>Recommended: Leave empty if you want all checklist items in your vault to be tasks managed by this plugin.</b></p>' +
                        '<p>Use a global filter if you want Tasks to only act on a subset of your "<code>- [ ]</code>" checklist items, so that ' +
                        'a checklist item must include the specified string in its description in order to be considered a task.<p>' +
                        '<p>For example, if you set the global filter to <code>#task</code>, the Tasks plugin will only handle checklist items tagged with <code>#task</code>.</br>' +
                        'Other checklist items will remain normal checklist items and not appear in queries or get a done date set.</p>' +
                        '<p>See the <a href="https://obsidian-tasks-group.github.io/obsidian-tasks/getting-started/global-filter/">documentation</a>.</p>',
                ),
            )
            .addText((text) => {
                const settings = getSettings();

                // I wanted to make this say 'for example, #task or TODO'
                // but wasn't able to figure out how to make the text box
                // wide enough for the whole string to be visible.
                text.setPlaceholder('e.g. #task or TODO')
                    .setValue(settings.globalFilter)
                    .onChange(async (value) => {
                        updateSettings({ globalFilter: value });

                        await this.plugin.saveSettings();
                    });
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

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Task Statuses' });
        // ---------------------------------------------------------------------------

        const { headingOpened } = getSettings();

        settingsJson.forEach((heading) => {
            this.addOneSettingsBlock(containerEl, heading, headingOpened);
        });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Date Settings' });
        // ---------------------------------------------------------------------------

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
            .setName('Use filename as Scheduled date for undated tasks')
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    'Save time entering Scheduled (⏳) dates.</br>' +
                        'If this option is enabled, any undated tasks will be given a default Scheduled date extracted from their file name.</br>' +
                        'The date in the file name must be in one of <code>YYYY-MM-DD</code> or <code>YYYYMMDD</code> formats.</br>' +
                        'Undated tasks have none of Due (📅 ), Scheduled (⏳) and Start (🛫) dates.</br>' +
                        '<p>See the <a href="https://obsidian-tasks-group.github.io/obsidian-tasks/getting-started/use-filename-as-default-date/">documentation</a>.</p>',
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.useFilenameAsScheduledDate).onChange(async (value) => {
                    updateSettings({ useFilenameAsScheduledDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Folders with default Scheduled dates')
            .setDesc(
                'Leave empty if you want to use default Scheduled dates everywhere, or enter a comma-separated list of folders.',
            )
            .addText(async (input) => {
                const settings = getSettings();
                await this.plugin.saveSettings();
                input
                    .setValue(SettingsTab.renderFolderArray(settings.filenameAsDateFolders))
                    .onChange(async (value) => {
                        const folders = SettingsTab.parseCommaSeparatedFolders(value);
                        updateSettings({ filenameAsDateFolders: folders });
                        await this.plugin.saveSettings();
                    });
            });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Auto-suggest Settings' });
        // ---------------------------------------------------------------------------

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

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Dialog Settings' });
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName('Provide access keys in dialogs')
            .setDesc(
                'If the access keys (keyboard shortcuts) for various controls' +
                    ' in dialog boxes conflict with system keyboard shortcuts' +
                    ' or assistive technology functionality that is important for you,' +
                    ' you may want to deactivate them here.',
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.provideAccessKeys).onChange(async (value) => {
                    updateSettings({ provideAccessKeys: value });
                    await this.plugin.saveSettings();
                });
            });
    }

    private addOneSettingsBlock(containerEl: HTMLElement, heading: any, headingOpened: HeadingState) {
        const detailsContainer = containerEl.createEl('details', {
            cls: 'tasks-nested-settings',
            attr: {
                ...(heading.open || headingOpened[heading.text] ? { open: true } : {}),
            },
        });
        detailsContainer.empty();
        detailsContainer.ontoggle = () => {
            headingOpened[heading.text] = detailsContainer.open;
            updateSettings({ headingOpened: headingOpened });
            this.plugin.saveSettings();
        };
        const summary = detailsContainer.createEl('summary');
        new Setting(summary).setHeading().setName(heading.text);
        summary.createDiv('collapser').createDiv('handle');

        // detailsContainer.createEl(heading.level as keyof HTMLElementTagNameMap, { text: heading.text });

        if (heading.notice !== null) {
            const notice = detailsContainer.createEl('div', {
                cls: heading.notice.class,
                text: heading.notice.text,
            });
            if (heading.notice.html !== null) {
                notice.insertAdjacentHTML('beforeend', heading.notice.html);
            }
        }

        // This will process all the settings from settingsConfiguration.json and render
        // them out reducing the duplication of the code in this file. This will become
        // more important as features are being added over time.
        heading.settings.forEach((setting: any) => {
            if (setting.featureFlag !== '' && !isFeatureEnabled(setting.featureFlag)) {
                // The settings configuration has a featureFlag set and the user has not
                // enabled it. Skip adding the settings option.
                return;
            }
            if (setting.type === 'checkbox') {
                new Setting(detailsContainer)
                    .setName(setting.name)
                    .setDesc(setting.description)
                    .addToggle((toggle) => {
                        const settings = getSettings();
                        if (!settings.generalSettings[setting.settingName]) {
                            updateGeneralSetting(setting.settingName, setting.initialValue);
                        }
                        toggle
                            .setValue(<boolean>settings.generalSettings[setting.settingName])
                            .onChange(async (value) => {
                                updateGeneralSetting(setting.settingName, value);
                                await this.plugin.saveSettings();
                            });
                    });
            } else if (setting.type === 'text') {
                new Setting(detailsContainer)
                    .setName(setting.name)
                    .setDesc(setting.description)
                    .addText((text) => {
                        const settings = getSettings();
                        if (!settings.generalSettings[setting.settingName]) {
                            updateGeneralSetting(setting.settingName, setting.initialValue);
                        }

                        const onChange = async (value: string) => {
                            updateGeneralSetting(setting.settingName, value);
                            await this.plugin.saveSettings();
                        };

                        text.setPlaceholder(setting.placeholder.toString())
                            .setValue(settings.generalSettings[setting.settingName].toString())
                            .onChange(debounce(onChange, 500, true));
                    });
            } else if (setting.type === 'textarea') {
                new Setting(detailsContainer)
                    .setName(setting.name)
                    .setDesc(setting.description)
                    .addTextArea((text) => {
                        const settings = getSettings();
                        if (!settings.generalSettings[setting.settingName]) {
                            updateGeneralSetting(setting.settingName, setting.initialValue);
                        }

                        const onChange = async (value: string) => {
                            updateGeneralSetting(setting.settingName, value);
                            await this.plugin.saveSettings();
                        };

                        text.setPlaceholder(setting.placeholder.toString())
                            .setValue(settings.generalSettings[setting.settingName].toString())
                            .onChange(debounce(onChange, 500, true));

                        text.inputEl.rows = 8;
                        text.inputEl.cols = 40;
                    });
            } else if (setting.type === 'function') {
                this.customFunctions[setting.settingName](detailsContainer, this);
            }

            if (setting.notice !== null) {
                const notice = detailsContainer.createEl('p', {
                    cls: setting.notice.class,
                    text: setting.notice.text,
                });
                if (setting.notice.html !== null) {
                    notice.insertAdjacentHTML('beforeend', setting.notice.html);
                }
            }
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

    /**
     * Settings for Core Task Status
     * These are built-in statuses that can have minimal edits made,
     * but are not allowed to be deleted or added to.
     *
     * @param {HTMLElement} containerEl
     * @param {SettingsTab} settings
     * @memberof SettingsTab
     */
    insertTaskCoreStatusSettings(containerEl: HTMLElement, settings: SettingsTab) {
        // TODO Make these statuses editable
        const coreStatuses: StatusSettings = new StatusSettings();
        StatusSettings.addCustomStatus(coreStatuses, Status.TODO);
        StatusSettings.addCustomStatus(coreStatuses, Status.IN_PROGRESS);
        StatusSettings.addCustomStatus(coreStatuses, Status.DONE);
        StatusSettings.addCustomStatus(coreStatuses, Status.CANCELLED);

        /* -------------------- One row per status in the settings -------------------- */
        coreStatuses.customStatusTypes.forEach((status_type) => {
            createRowForTaskStatus(containerEl, status_type, coreStatuses, settings, settings.plugin, false, false);
        });
    }

    /**
     * Settings for Custom Task Status
     *
     * @param {HTMLElement} containerEl
     * @param {SettingsTab} settings
     * @memberof SettingsTab
     */
    insertTaskStatusSettings(containerEl: HTMLElement, settings: SettingsTab) {
        const { statusSettings } = getSettings();

        /* -------------------- One row per status in the settings -------------------- */
        statusSettings.customStatusTypes.forEach((status_type) => {
            createRowForTaskStatus(containerEl, status_type, statusSettings, settings, settings.plugin, true, true);
        });

        containerEl.createEl('div');

        /* -------------------- 'Add New Task Status' button -------------------- */
        const setting = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText('Add New Task Status')
                .setCta()
                .onClick(async () => {
                    StatusSettings.addCustomStatus(statusSettings, new StatusConfiguration('', '', '', false));
                    await updateAndSaveStatusSettings(statusSettings, settings);
                });
        });
        setting.infoEl.remove();

        /* -------------------- Minimal Theme Supported Status Types -------------------- */
        const addStatusesSupportedByMinimalTheme = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText('Add all Status types supported by Minimal Theme')
                .setCta()
                .onClick(async () => {
                    await addCustomStatesToSettings(
                        StatusSettingsHelpers.minimalSupportedStatuses(),
                        statusSettings,
                        settings,
                    );
                });
        });
        addStatusesSupportedByMinimalTheme.infoEl.remove();

        /* -------------------- ITS Theme Supported Status Types -------------------- */
        const addStatusesSupportedByITSTheme = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText('Add all Status types supported by ITS Theme')
                .setCta()
                .onClick(async () => {
                    await addCustomStatesToSettings(
                        StatusSettingsHelpers.itsSupportedStatuses(),
                        statusSettings,
                        settings,
                    );
                });
        });
        addStatusesSupportedByITSTheme.infoEl.remove();
    }
}

/**
 * Create the row to see and modify settings for a single task status type.
 * @param containerEl
 * @param statusType - The status type to be edited.
 * @param statusSettings - All the status types already in the user's settings, EXCEPT the standard ones.
 * @param settings
 * @param plugin
 * @param deletable - whether the delete button wil be shown
 * @param editable - whether the edit button wil be shown
 */
function createRowForTaskStatus(
    containerEl: HTMLElement,
    statusType: StatusConfiguration,
    statusSettings: StatusSettings,
    settings: SettingsTab,
    plugin: TasksPlugin,
    deletable: boolean,
    editable: boolean,
) {
    //const taskStatusDiv = containerEl.createEl('div');

    const taskStatusPreview = containerEl.createEl('pre');
    taskStatusPreview.textContent = StatusSettingsHelpers.statusPreviewText(statusType);

    const setting = new Setting(containerEl);

    setting.infoEl.replaceWith(taskStatusPreview);

    if (deletable) {
        setting.addExtraButton((extra) => {
            extra
                .setIcon('cross')
                .setTooltip('Delete')
                .onClick(async () => {
                    if (StatusSettings.deleteCustomStatus(statusSettings, statusType)) {
                        await updateAndSaveStatusSettings(statusSettings, settings);
                    }
                });
        });
    }

    if (editable) {
        setting.addExtraButton((extra) => {
            extra
                .setIcon('pencil')
                .setTooltip('Edit')
                .onClick(async () => {
                    const modal = new CustomStatusModal(plugin, statusType);

                    modal.onClose = async () => {
                        if (modal.saved) {
                            if (
                                StatusSettings.replaceCustomStatus(
                                    statusSettings,
                                    statusType,
                                    modal.statusConfiguration(),
                                )
                            ) {
                                await updateAndSaveStatusSettings(statusSettings, settings);
                            }
                        }
                    };

                    modal.open();
                });
        });
    }

    setting.infoEl.remove();
}

async function addCustomStatesToSettings(
    supportedStatuses: Array<[string, string, string]>,
    statusSettings: StatusSettings,
    settings: SettingsTab,
) {
    const notices = StatusSettingsHelpers.addCustomStatusesCollection(supportedStatuses, statusSettings);

    notices.forEach((notice) => {
        new Notice(notice);
    });

    await updateAndSaveStatusSettings(statusSettings, settings);
}

async function updateAndSaveStatusSettings(statusTypes: StatusSettings, settings: SettingsTab) {
    updateSettings({
        statusSettings: statusTypes,
    });

    await settings.saveSettings(true);
}
