import { Notice, PluginSettingTab, Setting, debounce } from 'obsidian';
import { StatusConfiguration, StatusType } from '../Statuses/StatusConfiguration';
import type TasksPlugin from '../main';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import { Status } from '../Statuses/Status';
import type { StatusCollection } from '../Statuses/StatusCollection';
import { createStatusRegistryReport } from '../Statuses/StatusRegistryReport';
import { i18n } from '../i18n/i18n';
import type { TasksEvents } from '../Obsidian/TasksEvents';
import * as Themes from './Themes';
import {
    type HeadingState,
    TASK_FORMATS,
    getSettings,
    isFeatureEnabled,
    updateGeneralSetting,
    updateSettings,
} from './Settings';
import { GlobalFilter } from './GlobalFilter';
import { StatusSettings } from './StatusSettings';

import { CustomStatusModal } from './CustomStatusModal';
import { GlobalQuery } from './GlobalQuery';
import { PresetsSettingsUI } from './PresetsSettingsUI';

export class SettingsTab extends PluginSettingTab {
    // If the UI needs a more complex setting you can create a
    // custom function and specify it from the json file. It will
    // then be rendered instead of a normal checkbox or text box.
    customFunctions: { [K: string]: Function } = {
        insertTaskCoreStatusSettings: this.insertTaskCoreStatusSettings.bind(this),
        insertCustomTaskStatusSettings: this.insertCustomTaskStatusSettings.bind(this),
    };

    private readonly plugin: TasksPlugin;
    private readonly presetsSettingsUI;

    constructor({ plugin, events }: { plugin: TasksPlugin; events: TasksEvents }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
        this.presetsSettingsUI = new PresetsSettingsUI(plugin, events);
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

        containerEl.createEl('p', {
            cls: 'tasks-setting-important',
            text: i18n.t('settings.changeRequiresRestart'),
        });

        new Setting(containerEl)
            .setName(i18n.t('settings.format.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.format.description.line1')}</p>` +
                        `<p>${i18n.t('settings.format.description.line2')}</p>` +
                        this.seeTheDocumentation(
                            'https://publish.obsidian.md/tasks/Reference/Task+Formats/About+Task+Formats',
                        ),
                ),
            )
            .addDropdown((dropdown) => {
                for (const key of Object.keys(TASK_FORMATS) as (keyof TASK_FORMATS)[]) {
                    dropdown.addOption(key, TASK_FORMATS[key].getDisplayName());
                }

                dropdown.setValue(getSettings().taskFormat).onChange(async (value) => {
                    updateSettings({ taskFormat: value as keyof TASK_FORMATS });
                    await this.plugin.saveSettings();
                });
            });

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.globalFilter.heading')).setHeading();
        // ---------------------------------------------------------------------------
        let globalFilterHidden: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.globalFilter.filter.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p><b>${i18n.t('settings.globalFilter.filter.description.line1')}</b></p>` +
                        `<p>${i18n.t('settings.globalFilter.filter.description.line2')}<p>` +
                        `<p>${i18n.t('settings.globalFilter.filter.description.line3')}</br>` +
                        `${i18n.t('settings.globalFilter.filter.description.line4')}</p>` +
                        this.seeTheDocumentation('https://publish.obsidian.md/tasks/Getting+Started/Global+Filter'),
                ),
            )
            .addText((text) => {
                // I wanted to make this say 'for example, #task or TODO'
                // but wasn't able to figure out how to make the text box
                // wide enough for the whole string to be visible.
                text.setPlaceholder(i18n.t('settings.globalFilter.filter.placeholder'))
                    .setValue(GlobalFilter.getInstance().get())
                    .onChange(async (value) => {
                        updateSettings({ globalFilter: value });
                        GlobalFilter.getInstance().set(value);
                        await this.plugin.saveSettings();
                        setSettingVisibility(globalFilterHidden, value.length > 0);
                    });
            });

        globalFilterHidden = new Setting(containerEl)
            .setName(i18n.t('settings.globalFilter.removeFilter.name'))
            .setDesc(i18n.t('settings.globalFilter.removeFilter.description'))
            .addToggle((toggle) => {
                const settings = getSettings();

                toggle.setValue(settings.removeGlobalFilter).onChange(async (value) => {
                    updateSettings({ removeGlobalFilter: value });
                    GlobalFilter.getInstance().setRemoveGlobalFilter(value);
                    await this.plugin.saveSettings();
                });
            });
        setSettingVisibility(globalFilterHidden, getSettings().globalFilter.length > 0);

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.globalQuery.heading')).setHeading();
        // ---------------------------------------------------------------------------

        makeMultilineTextSetting(
            new Setting(containerEl)
                .setDesc(
                    SettingsTab.createFragmentWithHTML(
                        `<p>${i18n.t('settings.globalQuery.query.description')}</p>` +
                            this.seeTheDocumentation('https://publish.obsidian.md/tasks/Queries/Global+Query'),
                    ),
                )
                .addTextArea((text) => {
                    const settings = getSettings();

                    text.inputEl.rows = 4;
                    text.setPlaceholder('# ' + i18n.t('settings.globalQuery.query.placeholder'))
                        .setValue(settings.globalQuery)
                        .onChange(async (value) => {
                            updateSettings({ globalQuery: value });
                            GlobalQuery.getInstance().set(value);
                            await this.plugin.saveSettings();
                        });
                }),
        );

        // ---------------------------------------------------------------------------
        new Setting(containerEl)
            .setName(i18n.t('settings.presets.name'))
            .setHeading()
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    '<p>' +
                        i18n.t('settings.presets.line1', {
                            name: '<code>name</code>',
                            instruction1: '<code>preset name</code>',
                            instruction2: '<code>{{preset.name}}</code>',
                        }) +
                        '</p><p>' +
                        i18n.t('settings.presets.line2') +
                        '</p>' +
                        this.seeTheDocumentation('https://publish.obsidian.md/tasks/Queries/Presets'),
                ),
            );
        // ---------------------------------------------------------------------------
        this.presetsSettingsUI.renderPresetsSettings(containerEl);

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.statuses.heading')).setHeading();
        // ---------------------------------------------------------------------------

        const { headingOpened } = getSettings();

        // Directly define the JSON data as a constant object
        const settingsJson = [
            {
                text: i18n.t('settings.statuses.coreStatuses.heading'),
                level: 'h3',
                class: '',
                open: true,
                notice: {
                    class: 'setting-item-description',
                    text: null,
                    html:
                        '<p>' +
                        i18n.t('settings.statuses.coreStatuses.description.line1') +
                        '</p><p>' +
                        i18n.t('settings.statuses.coreStatuses.description.line2') +
                        '</p>',
                },
                settings: [
                    {
                        name: '',
                        description: '',
                        type: 'function',
                        initialValue: '',
                        placeholder: '',
                        settingName: 'insertTaskCoreStatusSettings',
                        featureFlag: '',
                        notice: null,
                    },
                ],
            },
            {
                text: i18n.t('settings.statuses.customStatuses.heading'),
                level: 'h3',
                class: '',
                open: true,
                notice: {
                    class: 'setting-item-description',
                    text: null,
                    html:
                        '<p>' +
                        i18n.t('settings.statuses.customStatuses.description.line1') +
                        '</p><p>' +
                        i18n.t('settings.statuses.customStatuses.description.line2') +
                        '</p><p>' +
                        i18n.t('settings.statuses.customStatuses.description.line3') +
                        '</p><p></p><p>' +
                        `<a href="https://publish.obsidian.md/tasks/Getting+Started/Statuses">${i18n.t(
                            'settings.statuses.customStatuses.description.line4',
                        )}</a></p>`,
                },
                settings: [
                    {
                        name: '',
                        description: '',
                        type: 'function',
                        initialValue: '',
                        placeholder: '',
                        settingName: 'insertCustomTaskStatusSettings',
                        featureFlag: '',
                        notice: null,
                    },
                ],
            },
        ];

        // Original usage remains unchanged
        settingsJson.forEach((heading) => {
            const initiallyOpen = headingOpened[heading.text] ?? true;
            const detailsContainer = this.addOneSettingsBlock(containerEl, heading, headingOpened);
            detailsContainer.open = initiallyOpen;
        });

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.dates.heading')).setHeading();
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName(i18n.t('settings.dates.createdDate.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.dates.createdDate.description') +
                        '</br>' +
                        this.seeTheDocumentation(
                            'https://publish.obsidian.md/tasks/Getting+Started/Dates#Created+date',
                        ),
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.setCreatedDate).onChange(async (value) => {
                    updateSettings({ setCreatedDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.dates.doneDate.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.dates.doneDate.description') +
                        '</br>' +
                        this.seeTheDocumentation('https://publish.obsidian.md/tasks/Getting+Started/Dates#Done+date'),
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.setDoneDate).onChange(async (value) => {
                    updateSettings({ setDoneDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.dates.cancelledDate.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.dates.cancelledDate.description') +
                        '</br>' +
                        this.seeTheDocumentation(
                            'https://publish.obsidian.md/tasks/Getting+Started/Dates#Cancelled+date',
                        ),
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.setCancelledDate).onChange(async (value) => {
                    updateSettings({ setCancelledDate: value });
                    await this.plugin.saveSettings();
                });
            });

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.datesFromFileNames.heading')).setHeading();
        // ---------------------------------------------------------------------------
        let scheduledDateExtraFormat: Setting | null = null;
        let scheduledDateFolders: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.datesFromFileNames.scheduledDate.toggle.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line1') +
                        '</br>' +
                        i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line2') +
                        '</br>' +
                        i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line3') +
                        '</br>' +
                        i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line4') +
                        '</br>' +
                        this.seeTheDocumentation(
                            'https://publish.obsidian.md/tasks/Getting+Started/Use+Filename+as+Default+Date',
                        ),
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.useFilenameAsScheduledDate).onChange(async (value) => {
                    updateSettings({ useFilenameAsScheduledDate: value });
                    setSettingVisibility(scheduledDateExtraFormat, value);
                    setSettingVisibility(scheduledDateFolders, value);
                    await this.plugin.saveSettings();
                });
            });

        scheduledDateExtraFormat = new Setting(containerEl)
            .setName(i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.description.line1') +
                        '</br>' +
                        `<p><a href="https://momentjs.com/docs/#/displaying/format/">${i18n.t(
                            'settings.datesFromFileNames.scheduledDate.extraFormat.description.line2',
                        )}</a></p>`,
                ),
            )
            .addText((text) => {
                const settings = getSettings();

                text.setPlaceholder(i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.placeholder'))
                    .setValue(settings.filenameAsScheduledDateFormat)
                    .onChange(async (value) => {
                        updateSettings({ filenameAsScheduledDateFormat: value });
                        await this.plugin.saveSettings();
                    });
            });

        scheduledDateFolders = new Setting(containerEl)
            .setName(i18n.t('settings.datesFromFileNames.scheduledDate.folders.name'))
            .setDesc(i18n.t('settings.datesFromFileNames.scheduledDate.folders.description'))
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
        setSettingVisibility(scheduledDateExtraFormat, getSettings().useFilenameAsScheduledDate);
        setSettingVisibility(scheduledDateFolders, getSettings().useFilenameAsScheduledDate);

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.recurringTasks.heading')).setHeading();
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName(i18n.t('settings.recurringTasks.nextLine.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.recurringTasks.nextLine.description') +
                        '</br>' +
                        this.seeTheDocumentation('https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks'),
                ),
            )
            .addToggle((toggle) => {
                const { recurrenceOnNextLine: recurrenceOnNextLine } = getSettings();
                toggle.setValue(recurrenceOnNextLine).onChange(async (value) => {
                    updateSettings({ recurrenceOnNextLine: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.recurringTasks.removeScheduledDate.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.recurringTasks.removeScheduledDate.description.line1') +
                        '</br>' +
                        i18n.t('settings.recurringTasks.removeScheduledDate.description.line2') +
                        '</br>' +
                        this.seeTheDocumentation('https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks'),
                ),
            )
            .addToggle((toggle) => {
                const { removeScheduledDateOnRecurrence } = getSettings();
                toggle.setValue(removeScheduledDateOnRecurrence).onChange(async (value) => {
                    updateSettings({ removeScheduledDateOnRecurrence: value });
                    await this.plugin.saveSettings();
                });
            });

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.autoSuggest.heading')).setHeading();
        // ---------------------------------------------------------------------------
        let autoSuggestMinimumMatchLength: Setting | null = null;
        let autoSuggestMaximumSuggestions: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.toggle.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.autoSuggest.toggle.description') +
                        '</br>' +
                        this.seeTheDocumentation('https://publish.obsidian.md/tasks/Getting+Started/Auto-Suggest'),
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.autoSuggestInEditor).onChange(async (value) => {
                    updateSettings({ autoSuggestInEditor: value });
                    await this.plugin.saveSettings();
                    setSettingVisibility(autoSuggestMinimumMatchLength, value);
                    setSettingVisibility(autoSuggestMaximumSuggestions, value);
                });
            });

        autoSuggestMinimumMatchLength = new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.minLength.name'))
            .setDesc(i18n.t('settings.autoSuggest.minLength.description'))
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

        autoSuggestMaximumSuggestions = new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.maxSuggestions.name'))
            .setDesc(i18n.t('settings.autoSuggest.maxSuggestions.description'))
            .addSlider((slider) => {
                const settings = getSettings();
                slider
                    .setLimits(3, 20, 1)
                    .setValue(settings.autoSuggestMaxItems)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMaxItems: value });
                        await this.plugin.saveSettings();
                    });
            });
        setSettingVisibility(autoSuggestMinimumMatchLength, getSettings().autoSuggestInEditor);
        setSettingVisibility(autoSuggestMaximumSuggestions, getSettings().autoSuggestInEditor);

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.dialogs.heading')).setHeading();
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName(i18n.t('settings.dialogs.accessKeys.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    i18n.t('settings.dialogs.accessKeys.description') +
                        '</br>' +
                        this.seeTheDocumentation(
                            'https://publish.obsidian.md/tasks/Getting+Started/Create+or+edit+Task#Keyboard+shortcuts',
                        ),
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.provideAccessKeys).onChange(async (value) => {
                    updateSettings({ provideAccessKeys: value });
                    await this.plugin.saveSettings();
                });
            });
    }

    private seeTheDocumentation(url: string) {
        return `<p><a href="${url}">${i18n.t('settings.seeTheDocumentation')}</a>.</p>`;
    }

    private addOneSettingsBlock(
        containerEl: HTMLElement,
        heading: any,
        headingOpened: HeadingState,
    ): HTMLDetailsElement {
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

        return detailsContainer;
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

        /* -------------------- 'Review and check your Statuses' button -------------------- */
        const createMermaidDiagram = new Setting(containerEl).addButton((button) => {
            const buttonName = i18n.t('settings.statuses.coreStatuses.buttons.checkStatuses.name');
            button
                .setButtonText(buttonName)
                .setCta()
                .onClick(async () => {
                    // Generate a new file unique file name, in the root of the vault
                    const now = window.moment();
                    const formattedDateTime = now.format('YYYY-MM-DD HH-mm-ss');
                    const filename = `Tasks Plugin - ${buttonName} ${formattedDateTime}.md`;

                    // Create the report
                    const version = this.plugin.manifest.version;
                    const statusRegistry = StatusRegistry.getInstance();
                    const fileContent = createStatusRegistryReport(statusSettings, statusRegistry, buttonName, version);

                    // Save the file
                    const file = await this.app.vault.create(filename, fileContent);

                    // And open the new file
                    const leaf = this.app.workspace.getLeaf(true);
                    await leaf.openFile(file);
                });
            button.setTooltip(i18n.t('settings.statuses.coreStatuses.buttons.checkStatuses.tooltip'));
        });
        createMermaidDiagram.infoEl.remove();
    }

    /**
     * Settings for Custom Task Status
     *
     * @param {HTMLElement} containerEl
     * @param {SettingsTab} settings
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
                .setButtonText(i18n.t('settings.statuses.customStatuses.buttons.addNewStatus.name'))
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
            [i18n.t('settings.statuses.collections.anuppuccinTheme'), Themes.anuppuccinSupportedStatuses()],
            [i18n.t('settings.statuses.collections.auraTheme'), Themes.auraSupportedStatuses()],
            [i18n.t('settings.statuses.collections.borderTheme'), Themes.borderSupportedStatuses()],
            [i18n.t('settings.statuses.collections.ebullientworksTheme'), Themes.ebullientworksSupportedStatuses()],
            [i18n.t('settings.statuses.collections.itsThemeAndSlrvbCheckboxes'), Themes.itsSupportedStatuses()],
            [i18n.t('settings.statuses.collections.minimalTheme'), Themes.minimalSupportedStatuses()],
            [i18n.t('settings.statuses.collections.thingsTheme'), Themes.thingsSupportedStatuses()],
            // Dark only themes - alphabetical order
            [i18n.t('settings.statuses.collections.lytModeTheme'), Themes.lytModeSupportedStatuses()],
        ];
        for (const [name, collection] of themes) {
            const addStatusesSupportedByThisTheme = new Setting(containerEl).addButton((button) => {
                const label = i18n.t('settings.statuses.collections.buttons.addCollection.name', {
                    themeName: name,
                    numberOfStatuses: collection.length,
                });
                button.setButtonText(label).onClick(async () => {
                    await addCustomStatesToSettings(collection, statusSettings, settings);
                });
            });
            addStatusesSupportedByThisTheme.infoEl.remove();
        }

        /* -------------------- 'Add All Unknown Status Types' button -------------------- */
        const addAllUnknownStatuses = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText(i18n.t('settings.statuses.customStatuses.buttons.addAllUnknown.name'))
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
                .setButtonText(i18n.t('settings.statuses.customStatuses.buttons.resetCustomStatuses.name'))
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

function makeMultilineTextSetting(setting: Setting) {
    const { settingEl, infoEl, controlEl } = setting;
    const textEl: HTMLElement | null = controlEl.querySelector('textarea');

    // Not a setting with a text field
    if (textEl === null) {
        return;
    }

    settingEl.style.display = 'block';
    infoEl.style.marginRight = '0px';
    textEl.style.minWidth = '-webkit-fill-available';
}

function setSettingVisibility(setting: Setting | null, visible: boolean) {
    if (setting) {
        // @ts-expect-error Setting.setVisibility() is not exposed in the API.
        // Source: https://discord.com/channels/686053708261228577/840286264964022302/1293725986042544139
        setting.setVisibility(visible);
    } else {
        console.warn('Setting has not be initialised. Can update visibility of setting UI - in setSettingVisibility');
    }
}
