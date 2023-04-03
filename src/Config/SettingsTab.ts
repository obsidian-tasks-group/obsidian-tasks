import { Notice, PluginSettingTab, Setting, debounce } from 'obsidian';
import { StatusConfiguration, StatusType } from '../StatusConfiguration';
import type TasksPlugin from '../main';
import { StatusRegistry } from '../StatusRegistry';
import { Status } from '../Status';
import type { StatusCollection } from '../StatusCollection';
import * as Themes from './Themes';
import type { HeadingState } from './Settings';
import { getSettings, isFeatureEnabled, updateGeneralSetting, updateSettings } from './Settings';
import { GlobalFilter } from './GlobalFilter';
import { StatusSettings } from './StatusSettings';
import settingsJson from './settingsConfiguration.json';

import { CustomStatusModal } from './CustomStatusModal';

export class SettingsTab extends PluginSettingTab {
    // If the UI needs a more complex setting you can create a
    // custom function and specify it from the json file. It will
    // then be rendered instead of a normal checkbox or text box.
    customFunctions: { [K: string]: Function } = {
        insertTaskCoreStatusSettings: this.insertTaskCoreStatusSettings.bind(this),
        insertCustomTaskStatusSettings: this.insertCustomTaskStatusSettings.bind(this),
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
                // I wanted to make this say 'for example, #task or TODO'
                // but wasn't able to figure out how to make the text box
                // wide enough for the whole string to be visible.
                text.setPlaceholder('e.g. #task or TODO')
                    .setValue(GlobalFilter.get())
                    .onChange(async (value) => {
                        GlobalFilter.set(value);
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
            .setName('Set created date on every added task')
            .setDesc(
                "Enabling this will add a timestamp ➕ YYYY-MM-DD before other date values, when a task is created with 'Create or edit task', or by completing a recurring task.",
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.setCreatedDate).onChange(async (value) => {
                    updateSettings({ setCreatedDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Set done date on every completed task')
            .setDesc('Enabling this will add a timestamp ✅ YYYY-MM-DD at the end when a task is toggled to done.')
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
        const { statusSettings } = getSettings();

        /* -------------------- One row per core status in the settings -------------------- */
        statusSettings.coreStatuses.forEach((status_type) => {
            createRowForTaskStatus(
                containerEl,
                status_type,
                statusSettings.coreStatuses,
                statusSettings,
                settings,
                settings.plugin,
                true, // isCoreStatus
            );
        });
    }

    /**
     * Settings for Custom Task Status
     *
     * @param {HTMLElement} containerEl
     * @param {SettingsTab} settings
     * @memberof SettingsTab
     */
    insertCustomTaskStatusSettings(containerEl: HTMLElement, settings: SettingsTab) {
        const { statusSettings } = getSettings();

        /* -------------------- One row per custom status in the settings -------------------- */
        statusSettings.customStatuses.forEach((status_type) => {
            createRowForTaskStatus(
                containerEl,
                status_type,
                statusSettings.customStatuses,
                statusSettings,
                settings,
                settings.plugin,
                false, // isCoreStatus
            );
        });

        containerEl.createEl('div');

        /* -------------------- 'Add New Task Status' button -------------------- */
        const setting = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText('Add New Task Status')
                .setCta()
                .onClick(async () => {
                    StatusSettings.addStatus(
                        statusSettings.customStatuses,
                        new StatusConfiguration('', '', '', false, StatusType.TODO),
                    );
                    await updateAndSaveStatusSettings(statusSettings, settings);
                });
        });
        setting.infoEl.remove();

        /* -------------------- Add all Status types supported by ... buttons -------------------- */
        type NamedTheme = [string, StatusCollection];
        const themes: NamedTheme[] = [
            // Light and Dark themes - alphabetical order
            ['AnuPpuccin Theme', Themes.anuppuccinSupportedStatuses()],
            ['Ebullientworks Theme', Themes.ebullientworksSupportedStatuses()],
            ['ITS Theme & SlRvb Checkboxes', Themes.itsSupportedStatuses()],
            ['Minimal Theme', Themes.minimalSupportedStatuses()],
            ['Things Theme', Themes.thingsSupportedStatuses()],
            // Dark only themes - alphabetical order
            ['Aura Theme (Dark mode only)', Themes.auraSupportedStatuses()],
        ];
        for (const [name, collection] of themes) {
            const addStatusesSupportedByThisTheme = new Setting(containerEl).addButton((button) => {
                const label = `${name}: Add ${collection.length} supported Statuses`;
                button.setButtonText(label).onClick(async () => {
                    await addCustomStatesToSettings(collection, statusSettings, settings);
                });
            });
            addStatusesSupportedByThisTheme.infoEl.remove();
        }

        /* -------------------- 'Add All Unknown Status Types' button -------------------- */
        const addAllUnknownStatuses = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText('Add All Unknown Status Types')
                .setCta()
                .onClick(async () => {
                    const tasks = this.plugin.getTasks();
                    const allStatuses = tasks!.map((task) => {
                        return task.status;
                    });
                    const unknownStatuses = StatusRegistry.getInstance().findUnknownStatuses(allStatuses);
                    if (unknownStatuses.length === 0) {
                        return;
                    }
                    unknownStatuses.forEach((s) => {
                        StatusSettings.addStatus(statusSettings.customStatuses, s);
                    });
                    await updateAndSaveStatusSettings(statusSettings, settings);
                });
        });
        addAllUnknownStatuses.infoEl.remove();

        /* -------------------- 'Reset Custom Status Types to Defaults' button -------------------- */
        const clearCustomStatuses = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText('Reset Custom Status Types to Defaults')
                .setWarning()
                .onClick(async () => {
                    StatusSettings.resetAllCustomStatuses(statusSettings);
                    await updateAndSaveStatusSettings(statusSettings, settings);
                });
        });
        clearCustomStatuses.infoEl.remove();
    }
}

/**
 * Create the row to see and modify settings for a single task status type.
 * @param containerEl
 * @param statusType - The status type to be edited.
 * @param statuses - The list of statuses that statusType is stored in.
 * @param statusSettings - All the status types already in the user's settings, EXCEPT the standard ones.
 * @param settings
 * @param plugin
 * @param isCoreStatus - whether the status is a core status
 */
function createRowForTaskStatus(
    containerEl: HTMLElement,
    statusType: StatusConfiguration,
    statuses: StatusConfiguration[],
    statusSettings: StatusSettings,
    settings: SettingsTab,
    plugin: TasksPlugin,
    isCoreStatus: boolean,
) {
    //const taskStatusDiv = containerEl.createEl('div');

    const taskStatusPreview = containerEl.createEl('pre');
    taskStatusPreview.addClass('row-for-status');
    taskStatusPreview.textContent = new Status(statusType).previewText();

    const setting = new Setting(containerEl);

    setting.infoEl.replaceWith(taskStatusPreview);

    if (!isCoreStatus) {
        setting.addExtraButton((extra) => {
            extra
                .setIcon('cross')
                .setTooltip('Delete')
                .onClick(async () => {
                    if (StatusSettings.deleteStatus(statuses, statusType)) {
                        await updateAndSaveStatusSettings(statusSettings, settings);
                    }
                });
        });
    }

    setting.addExtraButton((extra) => {
        extra
            .setIcon('pencil')
            .setTooltip('Edit')
            .onClick(async () => {
                const modal = new CustomStatusModal(plugin, statusType, isCoreStatus);

                modal.onClose = async () => {
                    if (modal.saved) {
                        if (StatusSettings.replaceStatus(statuses, statusType, modal.statusConfiguration())) {
                            await updateAndSaveStatusSettings(statusSettings, settings);
                        }
                    }
                };

                modal.open();
            });
    });

    setting.infoEl.remove();
}

async function addCustomStatesToSettings(
    supportedStatuses: StatusCollection,
    statusSettings: StatusSettings,
    settings: SettingsTab,
) {
    const notices = StatusSettings.bulkAddStatusCollection(statusSettings, supportedStatuses);

    notices.forEach((notice) => {
        new Notice(notice);
    });

    await updateAndSaveStatusSettings(statusSettings, settings);
}

async function updateAndSaveStatusSettings(statusTypes: StatusSettings, settings: SettingsTab) {
    updateSettings({
        statusSettings: statusTypes,
    });

    // Update the active statuses.
    // This saves the user from having to restart Obsidian in order to apply the changed status(es).
    StatusSettings.applyToStatusRegistry(statusTypes, StatusRegistry.getInstance());

    await settings.saveSettings(true);
}
