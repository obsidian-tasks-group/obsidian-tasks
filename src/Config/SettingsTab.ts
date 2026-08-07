import {
    ButtonComponent,
    type ConfirmationButton,
    ConfirmationModal,
    Menu,
    Modal,
    Notice,
    PluginSettingTab,
    Setting,
    type SettingDefinition,
    type SettingDefinitionItem,
    type ToggleComponent,
    debounce,
    requireApiVersion,
    sanitizeHTMLToDom,
} from 'obsidian';
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
    type Settings,
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
import { GlobalQueryModal } from './GlobalQueryModal';
import { PresetsSettingsUI } from './PresetsSettingsUI';
import { EnableJsInTasksQueries } from './EnableJsInTasksQueries';

interface SettingConfiguration {
    name: string;
    description: string;
    type: string;
    initialValue: string;
    placeholder: string;
    settingName: string;
    featureFlag: string;
    notice: { class: string; text: string | null; html: string | null } | null;
}

interface HeadingConfiguration {
    text: string;
    level: string;
    class: string;
    open: boolean;
    notice: { class: string; text: string | null; html: string | null } | null;
    settings: SettingConfiguration[];
}

/**
 * A snapshot of the settings when the plugin loaded.
 * {@link SettingsTab.withReload} compares current values against these.
 */
let settingsAtPluginLoad: Settings | null = null;

function getSettingsAtPluginLoad(): Settings {
    settingsAtPluginLoad ??= JSON.parse(JSON.stringify(getSettings()));
    return settingsAtPluginLoad as Settings;
}

/**
 * The plugin's settings tab, with two implementations of the UI:
 *
 * - {@link getSettingDefinitions} — the declarative API, used by Obsidian 1.13.0 and later.
 * - {@link display} — the imperative fallback, used by older Obsidian versions.
 *
 * Obsidian picks the right path per host, so BOTH implementations must be
 * updated whenever a setting is added, removed or changed.
 */
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
    private readonly events: TasksEvents;

    constructor({ plugin, events }: { plugin: TasksPlugin; events: TasksEvents }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
        this.presetsSettingsUI = new PresetsSettingsUI(plugin, events);
        this.events = events;

        // Record the setting values now, before the user can change them.
        getSettingsAtPluginLoad();
    }

    private static readonly createFragmentWithHTML = (html: string) => sanitizeHTMLToDom(html);

    public saveSettingsAndRebuildSettingsTab(): void {
        void this.plugin.saveSettings();
        this.rebuildSettingsTab();
    }

    private rebuildSettingsTab(): void {
        // Rebuilding the settings tab resets it to the top, so restore how far down it was.
        const previousDistanceFromTop = this.containerEl.scrollTop;

        if (requireApiVersion('1.13.0')) {
            // Obsidian 1.13.0+ renders this tab from getSettingDefinitions(),
            // so rebuild it declaratively. display() would render nothing here.
            this.update();
        } else {
            this.display();
        }

        requestAnimationFrame(() => {
            this.containerEl.scrollTo({ top: previousDistanceFromTop });
        });
    }

    // -----------------------------------------------------------------------
    // Declarative settings API (Obsidian 1.13.0+)
    //
    // Settings live in a module-level store (getSettings/updateSettings), not
    // on this.plugin.settings, so override the control-binding hooks.
    // -----------------------------------------------------------------------

    public getControlValue(key: string): unknown {
        return (getSettings() as unknown as Record<string, unknown>)[key];
    }

    public async setControlValue(key: string, value: unknown): Promise<void> {
        updateSettings({ [key]: value });
        await this.plugin.saveSettings();
    }

    /**
     * Convenience: build a `render` callback that adds a toggle plus a docs
     * extraButton. Reads/writes via the same getControlValue/setControlValue
     * bridge as a `control` definition.
     */
    private renderToggleWithDocs(key: keyof ReturnType<typeof getSettings>, docsUrl: string) {
        return this.withDocs((setting: Setting) => {
            setting.addToggle((toggle) => {
                toggle.setValue(this.getControlValue(key) as boolean).onChange(async (value) => {
                    await this.setControlValue(key, value);
                });
            });
        }, docsUrl);
    }

    /**
     * Convenience: build a `render` callback that adds a docs extraButton onto
     * an existing render callback.
     */
    private withDocs(inner: (setting: Setting) => void, docsUrl: string) {
        return (setting: Setting) => {
            setting.addExtraButton((btn) =>
                btn
                    .setIcon('book-open')
                    .setTooltip(i18n.t('settings.seeTheDocumentation'))
                    .onClick(() => window.open(docsUrl, '_blank', 'noopener')),
            );
            inner(setting);
        };
    }

    /**
     * Wrap a render callback with a "Reload" button for a setting whose effect
     * only takes after the host window reloads (`settings.changeRequiresRestart`).
     *
     * The button is shown whenever the setting's current value differs from
     * the value in use since the plugin loaded, so it survives tab rebuilds and
     * closing/reopening the settings, and it disappears again if the value is
     * changed back.
     *
     * The inner callback receives a `refreshReloadButton()` it must call from
     * its own onChange handler, after persisting the new value.
     */
    private withReload(key: keyof Settings, inner: (setting: Setting, refreshReloadButton: () => void) => void) {
        return (setting: Setting) => {
            let reloadBtn: ButtonComponent | null = null;
            const refreshReloadButton = () => {
                const needsReload =
                    JSON.stringify(getSettings()[key]) !== JSON.stringify(getSettingsAtPluginLoad()[key]);
                if (needsReload && reloadBtn === null) {
                    reloadBtn = this.addReloadButton(setting);
                }
                reloadBtn?.buttonEl.toggle(needsReload);
            };
            inner(setting, refreshReloadButton);
            // Show the button now if a reload is already pending.
            refreshReloadButton();
        };
    }

    private addReloadButton(setting: Setting): ButtonComponent {
        let button!: ButtonComponent;
        setting.addButton((btn) => {
            button = btn;
            btn.setButtonText(i18n.t('common.reload'))
                .setCta()
                .onClick(() => window.location.reload());
            // Put the button before the control, to match Obsidian's own 'Relaunch' buttons.
            setting.controlEl.prepend(btn.buttonEl);
        });
        return button;
    }

    public getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            this.taskFormatDefinition(),
            this.globalDefaultsGroup(),
            this.searchesGroup(),
            this.presetsPage(),
            this.statusesPage(),
            this.datesGroup(),
            this.datesFromFilenamesGroup(),
            this.recurringTasksGroup(),
            this.taskEntryGroup(),
        ];
    }

    // ---- Task format (general, no heading) --------------------------------

    private taskFormatDefinition(): SettingDefinitionItem {
        return {
            name: i18n.t('settings.format.name'),
            desc: SettingsTab.createFragmentWithHTML(
                `<p>${i18n.t('settings.format.description.line1')}</p>` +
                    `<p>${i18n.t('settings.format.description.line2')}</p>`,
            ),
            render: this.withDocs(
                this.withReload('taskFormat', (setting, refreshReloadButton) => {
                    setting.addDropdown((dropdown) => {
                        for (const key of Object.keys(TASK_FORMATS) as (keyof TASK_FORMATS)[]) {
                            dropdown.addOption(key, TASK_FORMATS[key].getDisplayName());
                        }
                        dropdown.setValue(getSettings().taskFormat).onChange(async (value) => {
                            updateSettings({ taskFormat: value as keyof TASK_FORMATS });
                            await this.plugin.saveSettings();
                            refreshReloadButton();
                        });
                    });
                }),
                'https://publish.obsidian.md/tasks/Reference/Task+Formats/About+Task+Formats',
            ),
        };
    }

    // ---- Global defaults (filter + query) ---------------------------------

    private globalDefaultsGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.globalDefaults.heading'),
            items: [
                {
                    name: i18n.t('settings.globalFilter.filter.name'),
                    desc: SettingsTab.createFragmentWithHTML(
                        `<p><b>${i18n.t('settings.globalFilter.filter.description.line1')}</b></p>` +
                            `<p>${i18n.t('settings.globalFilter.filter.description.line2')}</p>` +
                            `<p>${i18n.t('settings.globalFilter.filter.description.line3')} ` +
                            `${i18n.t('settings.globalFilter.filter.description.line4')}</p>`,
                    ),
                    render: this.withDocs((setting) => {
                        setting.addText((text) => {
                            text.setPlaceholder(i18n.t('settings.globalFilter.filter.placeholder'))
                                .setValue(GlobalFilter.getInstance().get())
                                .onChange(
                                    debounce(
                                        async (value) => {
                                            updateSettings({ globalFilter: value });
                                            GlobalFilter.getInstance().set(value);
                                            await this.plugin.saveSettings();
                                            // Re-evaluate the 'visible' predicate of the remove-filter row.
                                            if (requireApiVersion('1.13.0')) {
                                                this.refreshDomState();
                                            }
                                            this.events.triggerReloadVault();
                                        },
                                        500,
                                        true,
                                    ),
                                );
                        });
                    }, 'https://publish.obsidian.md/tasks/Getting+Started/Global+Filter'),
                },
                {
                    name: i18n.t('settings.globalFilter.removeFilter.name'),
                    desc: i18n.t('settings.globalFilter.removeFilter.description'),
                    visible: () => getSettings().globalFilter.length > 0,
                    render: this.withReload('removeGlobalFilter', (setting, refreshReloadButton) => {
                        setting.addToggle((toggle) => {
                            toggle.setValue(getSettings().removeGlobalFilter).onChange(async (value) => {
                                updateSettings({ removeGlobalFilter: value });
                                GlobalFilter.getInstance().setRemoveGlobalFilter(value);
                                await this.plugin.saveSettings();
                                refreshReloadButton();
                            });
                        });
                    }),
                },
                {
                    name: i18n.t('settings.globalQuery.heading'),
                    desc: i18n.t('settings.globalQuery.query.shortDescription'),
                    render: this.withDocs((setting) => {
                        setting.addExtraButton((btn) =>
                            btn
                                .setIcon('pencil')
                                .setTooltip(i18n.t('common.edit'))
                                .onClick(() => this.openGlobalQueryModal()),
                        );
                    }, 'https://publish.obsidian.md/tasks/Queries/Global+Query'),
                },
            ],
        };
    }

    private openGlobalQueryModal(): void {
        new GlobalQueryModal(this.app, getSettings().globalQuery, async (value) => {
            updateSettings({ globalQuery: value });
            GlobalQuery.getInstance().set(value);
            await this.plugin.saveSettings();
            this.events.triggerReloadOpenSearchResults();
        }).open();
    }

    // ---- Searches & search results ---------------------------------------

    private searchesGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.searches.heading'),
            items: [
                {
                    name: i18n.t('settings.searches.enableCustomSearches.name'),
                    desc: SettingsTab.createFragmentWithHTML(
                        i18n.t('settings.searches.enableCustomSearches.description.line1', {
                            filterByFunction: '<code>filter by function</code>',
                            sortByFunction: '<code>sort by function</code>',
                            groupByFunction: '<code>group by function</code>',
                        }),
                    ),
                    render: (setting) => this.renderEnableCustomSearchesToggle(setting),
                },
                {
                    name: i18n.t('settings.searchResults.taskCountLocation.name'),
                    desc: i18n.t('settings.searchResults.taskCountLocation.description'),
                    render: (setting) => {
                        setting.addDropdown((dropdown) => {
                            dropdown.addOption('top', i18n.t('settings.searchResults.taskCountLocation.options.top'));
                            dropdown.addOption(
                                'bottom',
                                i18n.t('settings.searchResults.taskCountLocation.options.bottom'),
                            );
                            dropdown.setValue(getSettings().searchResults.taskCountLocation).onChange(async (value) => {
                                updateSettings({
                                    searchResults: { taskCountLocation: value as 'top' | 'bottom' },
                                });
                                await this.plugin.saveSettings();
                                this.events.triggerReloadOpenSearchResults();
                            });
                        });
                    },
                },
            ],
        };
    }

    private renderEnableCustomSearchesToggle(setting: Setting): void {
        setting.addToggle((toggle) => {
            toggle.setValue(EnableJsInTasksQueries.getInstance().get()).onChange((value) => {
                if (!value) {
                    // Turning OFF: no confirmation needed.
                    EnableJsInTasksQueries.getInstance().set(false);
                    this.events.triggerReloadOpenSearchResults();
                    return;
                }
                // Turning ON: require explicit acknowledgement.
                this.confirmEnableCustomSearches((confirmed) => this.applyCustomSearchesChoice(toggle, confirmed));
            });
        });
    }

    private applyCustomSearchesChoice(toggle: ToggleComponent, confirmed: boolean): void {
        if (confirmed) {
            EnableJsInTasksQueries.getInstance().set(true);
            this.events.triggerReloadOpenSearchResults();
        } else {
            // Revert the toggle UI back to off.
            toggle.setValue(false);
        }
    }

    /**
     * Show a {@link ConfirmationModal} explaining the risks of enabling custom
     * searches (which let queries execute arbitrary JavaScript). The user must
     * tick a checkbox before the Enable button is available. Calls back with
     * `true` if the user enabled, `false` if they cancelled or closed.
     */
    private confirmEnableCustomSearches(callback: (confirmed: boolean) => void): void {
        // The version check is always true in practice: this method is only
        // called from the declarative settings path, which requires 1.13.0+.
        if (requireApiVersion('1.13.0')) {
            const modal = new ConfirmationModal(this.app);
            modal.setTitle(i18n.t('settings.searches.enableCustomSearches.name'));

            modal.contentEl.createEl('p', {
                cls: 'setting-item-description',
                text: i18n.t('settings.searches.enableCustomSearches.description.line2'),
            });
            const warningEl = modal.contentEl.createEl('p', { cls: 'setting-item-description mod-warning' });
            warningEl.createEl('b', {
                text: i18n.t('settings.searches.enableCustomSearches.description.line3'),
            });
            modal.contentEl.createEl('p', {
                cls: 'setting-item-description',
                text: i18n.t('settings.searches.enableCustomSearches.description.line4'),
            });

            let acknowledged = false;
            let enableBtn: ConfirmationButton | null = null;
            modal.addCheckbox(i18n.t('settings.searches.enableCustomSearches.confirm.acknowledge'), (value) => {
                acknowledged = value;
                if (enableBtn) {
                    enableBtn.setDisabled(!acknowledged);
                }
            });

            let decided = false;
            // Cancel first: on desktop, DOM order decides and the primary action
            // belongs on the right. Mobile reorders Cancel with CSS regardless.
            modal.addCancelButton();
            modal.addButton((btn) => {
                enableBtn = btn;
                btn.setButtonText(i18n.t('settings.searches.enableCustomSearches.confirm.enable'))
                    .setCta()
                    .setDisabled(true)
                    .onClick(() => {
                        if (!acknowledged) {
                            return true; // keep the modal open
                        }
                        decided = true;
                        callback(true);
                        return undefined;
                    });
            });

            const originalOnClose = modal.onClose.bind(modal);
            modal.onClose = () => {
                originalOnClose();
                if (!decided) {
                    callback(false);
                }
            };
            modal.open();
        } else {
            callback(false);
        }
    }

    // ---- Presets (sub-page) ----------------------------------------------

    private presetsPage(): SettingDefinitionItem {
        return {
            type: 'page',
            name: i18n.t('settings.presets.name'),
            desc: SettingsTab.createFragmentWithHTML(
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
            items: this.presetsSettingsUI.getPresetsDefinitions(() => this.rebuildSettingsTab()),
        };
    }

    // ---- Statuses (sub-page) ---------------------------------------------

    private statusesPage(): SettingDefinitionItem {
        const { statusSettings } = getSettings();

        // Lets the custom-statuses search filter on the status symbol, name and type.
        const rowStatuses = new WeakMap<SettingDefinition, StatusConfiguration>();
        const statusRow = (status: StatusConfiguration, isCoreStatus: boolean): SettingDefinition => {
            const row = this.statusRow(status, isCoreStatus);
            rowStatuses.set(row, status);
            return row;
        };

        return {
            type: 'page',
            name: i18n.t('settings.statuses.heading'),
            status: () => (this.statusesChangedSinceLoad() ? 'warning' : null),
            items: [
                {
                    type: 'list',
                    heading: i18n.t('settings.statuses.coreStatuses.heading'),
                    extraButtons: [
                        (btn) =>
                            btn
                                .setIcon('info')
                                .setTooltip(i18n.t('common.moreInfo'))
                                .onClick(() =>
                                    this.showInfoModal(
                                        i18n.t('settings.statuses.coreStatuses.heading'),
                                        `<p>${i18n.t('settings.statuses.coreStatuses.description.line1')}</p>` +
                                            `<p>${i18n.t('settings.statuses.coreStatuses.description.line2')}</p>`,
                                        'https://publish.obsidian.md/tasks/Getting+Started/Statuses',
                                    ),
                                ),
                    ],
                    items: [
                        ...statusSettings.coreStatuses.map((status) => statusRow(status, true)),
                        {
                            name: i18n.t('settings.statuses.coreStatuses.buttons.checkStatuses.name'),
                            desc: i18n.t('settings.statuses.coreStatuses.buttons.checkStatuses.tooltip'),
                            searchable: false,
                            action: async () => {
                                await this.createStatusRegistryReport();
                            },
                        },
                    ],
                },
                {
                    type: 'list',
                    heading: i18n.t('settings.statuses.customStatuses.heading'),
                    emptyState: i18n.t('settings.statuses.customStatuses.emptyState'),
                    search: {
                        placeholder: i18n.t('settings.statuses.filter.placeholder'),
                        match: (def, query) => {
                            const status = rowStatuses.get(def);
                            if (!status) {
                                return true;
                            }
                            const q = query.toLowerCase();
                            return (
                                status.name.toLowerCase().includes(q) ||
                                status.symbol.toLowerCase().includes(q) ||
                                humanizeStatusType(status.type).toLowerCase().includes(q)
                            );
                        },
                    },
                    extraButtons: [
                        (btn) =>
                            btn
                                .setIcon('info')
                                .setTooltip(i18n.t('common.moreInfo'))
                                .onClick(() =>
                                    this.showInfoModal(
                                        i18n.t('settings.statuses.customStatuses.heading'),
                                        `<p>${i18n.t('settings.statuses.customStatuses.description.line1')}</p>` +
                                            `<p>${i18n.t('settings.statuses.customStatuses.description.line2')}</p>` +
                                            `<p>${i18n.t('settings.statuses.customStatuses.description.line3')}</p>`,
                                        'https://publish.obsidian.md/tasks/Getting+Started/Statuses',
                                    ),
                                ),
                    ],
                    onDelete: (index) => {
                        const { statusSettings: current } = getSettings();
                        current.customStatuses.splice(index, 1);
                        updateAndSaveStatusSettings(current, this);
                    },
                    addItem: {
                        name: i18n.t('settings.statuses.buttons.addStatus'),
                        action: () => {
                            const draft = new StatusConfiguration('', '', '', false, StatusType.TODO);
                            const modal = new CustomStatusModal(this.plugin, draft, false);
                            modal.onClose = () => {
                                if (!modal.saved) {
                                    return;
                                }
                                const { statusSettings: current } = getSettings();
                                StatusSettings.addStatus(current.customStatuses, modal.statusConfiguration());
                                updateAndSaveStatusSettings(current, this);
                            };
                            modal.open();
                        },
                    },
                    items: statusSettings.customStatuses.map((status) => statusRow(status, false)),
                },
                {
                    type: 'list',
                    items: [
                        {
                            name: i18n.t('settings.statuses.buttons.importFromTheme.name'),
                            desc: i18n.t('settings.statuses.buttons.importFromTheme.description'),
                            searchable: false,
                            action: (el) => this.showImportFromThemeMenu(el),
                        },
                        {
                            name: i18n.t('settings.statuses.customStatuses.buttons.addAllUnknown.name'),
                            desc: i18n.t('settings.statuses.customStatuses.buttons.addAllUnknown.description'),
                            searchable: false,
                            action: () => {
                                const { statusSettings: current } = getSettings();
                                const tasks = this.plugin.getTasks();
                                const unknownStatuses = StatusRegistry.getInstance().findUnknownStatuses(
                                    tasks.map((task) => task.status),
                                );
                                if (unknownStatuses.length === 0) {
                                    return;
                                }
                                unknownStatuses.forEach((s) => {
                                    StatusSettings.addStatus(current.customStatuses, s);
                                });
                                updateAndSaveStatusSettings(current, this);
                            },
                        },
                        {
                            name: i18n.t('settings.statuses.customStatuses.buttons.resetCustomStatuses.name'),
                            desc: i18n.t('settings.statuses.customStatuses.buttons.resetCustomStatuses.description'),
                            searchable: false,
                            action: () => {
                                const { statusSettings: current } = getSettings();
                                StatusSettings.resetAllCustomStatuses(current);
                                updateAndSaveStatusSettings(current, this);
                            },
                        },
                    ],
                },
            ],
        };
    }

    /**
     * Status edits only fully take effect after a reload, so a Notice prompts
     * for a reload whenever the statuses differ from those in use.
     */
    private statusesChangedSinceLoad(): boolean {
        return (
            JSON.stringify(getSettings().statusSettings) !== JSON.stringify(getSettingsAtPluginLoad().statusSettings)
        );
    }

    private reloadNotice: Notice | null = null;

    /**
     * Show a Notice with a Reload button after a status edit. The one Notice
     * is reused, so editing several statuses does not stack notices; it hides
     * again if the statuses return to the values in use.
     */
    public refreshStatusesReloadNotice(): void {
        if (!this.statusesChangedSinceLoad()) {
            this.reloadNotice?.hide();
            this.reloadNotice = null;
            return;
        }
        if (this.reloadNotice !== null && this.reloadNotice.messageEl.isConnected) {
            return;
        }

        const notice = new Notice(i18n.t('settings.statuses.reloadRequired'), 0);
        const buttonContainerEl = notice.containerEl.createDiv('notice-button-container');
        const ctaEl = buttonContainerEl.createDiv({ cls: 'notice-cta', text: i18n.t('common.reload') });
        ctaEl.addEventListener('click', () => {
            notice.hide();
            window.location.reload();
        });
        this.reloadNotice = notice;
    }

    /**
     * Show a menu of the theme status collections, anchored below `anchorEl`;
     * choosing one imports its statuses into the custom statuses list.
     */
    private showImportFromThemeMenu(anchorEl: HTMLElement): void {
        const menu = new Menu();
        for (const { name, collection } of getThemeCollections()) {
            menu.addItem((item) =>
                item
                    .setTitle(
                        i18n.t('settings.statuses.collections.buttons.importCollection.name', {
                            themeName: name,
                            numberOfStatuses: collection.length,
                        }),
                    )
                    .onClick(() => {
                        const { statusSettings: current } = getSettings();
                        addCustomStatesToSettings(collection, current, this);
                    }),
            );
        }
        const rect = anchorEl.getBoundingClientRect();
        menu.showAtPosition({ x: rect.left, y: rect.bottom });
    }

    /**
     * Show a small modal with descriptive text about a section, opened from an
     * info button in the section's header. The footer offers the section's
     * documentation, and an Okay button to dismiss.
     */
    private showInfoModal(title: string, html: string, docsUrl: string): void {
        const modal = new Modal(this.app);
        modal.setTitle(title);
        modal.contentEl.append(SettingsTab.createFragmentWithHTML(html));

        const buttonContainerEl = modal.contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl)
            .setButtonText(i18n.t('settings.seeTheDocumentation'))
            .setClass('mod-secondary')
            .onClick(() => window.open(docsUrl, '_blank', 'noopener'));
        new ButtonComponent(buttonContainerEl).setButtonText(i18n.t('common.okay')).onClick(() => modal.close());
        modal.open();
    }

    /**
     * Builds one list row for a single status. The row's `name` is the
     * status's friendly name, with the symbol prepended as a `<code>` chip; a
     * pencil extraButton opens the existing edit modal. Deletion is wired by
     * the list's `onDelete`, so no per-row delete button is needed.
     */
    private statusRow(status: StatusConfiguration, isCoreStatus: boolean): SettingDefinition {
        const symbol = status.symbol || ' ';
        return {
            name: status.name || i18n.t('settings.statuses.unnamed'),
            render: (setting) => {
                // Prepend the symbol to the left of the row's name — reads as
                // the list marker for the friendly name beside it (`- [/] In progress`).
                setting.nameEl.prepend(createEl('code', { cls: 'tasks-status-symbol', text: `- [${symbol}]` }));
                setting.addExtraButton((btn) => {
                    btn.setIcon('pencil')
                        .setTooltip(i18n.t('common.edit'))
                        .onClick(() => this.openEditStatusModal(status, isCoreStatus));
                });
            },
        };
    }

    /**
     * Open the edit modal for a status, and persist the edit when it is saved.
     */
    private openEditStatusModal(status: StatusConfiguration, isCoreStatus: boolean): void {
        const modal = new CustomStatusModal(this.plugin, status, isCoreStatus);
        modal.onClose = () => {
            if (!modal.saved) {
                return;
            }
            const { statusSettings: current } = getSettings();
            const list = isCoreStatus ? current.coreStatuses : current.customStatuses;
            if (StatusSettings.replaceStatus(list, status, modal.statusConfiguration())) {
                updateAndSaveStatusSettings(current, this);
            }
        };
        modal.open();
    }

    private async createStatusRegistryReport(): Promise<void> {
        const { statusSettings } = getSettings();
        const buttonName = i18n.t('settings.statuses.coreStatuses.buttons.checkStatuses.name');

        // Generate a new file unique file name, in the root of the vault
        const now = window.moment();
        const formattedDateTime = now.format('YYYY-MM-DD HH-mm-ss');
        const filename = `Tasks Plugin - ${buttonName} ${formattedDateTime}.md`;

        // Create the report
        const version = this.plugin.manifest.version;
        const fileContent = createStatusRegistryReport(
            statusSettings,
            StatusRegistry.getInstance(),
            buttonName,
            version,
        );

        // Save the file, and open it
        const file = await this.app.vault.create(filename, fileContent);
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.openFile(file);
    }

    // ---- Dates ------------------------------------------------------------

    private datesGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.dates.heading'),
            items: [
                {
                    name: i18n.t('settings.dates.createdDate.name'),
                    desc: i18n.t('settings.dates.createdDate.description'),
                    render: this.renderToggleWithDocs(
                        'setCreatedDate',
                        'https://publish.obsidian.md/tasks/Getting+Started/Dates#Created+date',
                    ),
                },
                {
                    name: i18n.t('settings.dates.doneDate.name'),
                    desc: i18n.t('settings.dates.doneDate.description'),
                    render: this.renderToggleWithDocs(
                        'setDoneDate',
                        'https://publish.obsidian.md/tasks/Getting+Started/Dates#Done+date',
                    ),
                },
                {
                    name: i18n.t('settings.dates.cancelledDate.name'),
                    desc: i18n.t('settings.dates.cancelledDate.description'),
                    render: this.renderToggleWithDocs(
                        'setCancelledDate',
                        'https://publish.obsidian.md/tasks/Getting+Started/Dates#Cancelled+date',
                    ),
                },
            ],
        };
    }

    // ---- Dates from file names -------------------------------------------

    private datesFromFilenamesGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.datesFromFileNames.heading'),
            items: [
                {
                    name: i18n.t('settings.datesFromFileNames.scheduledDate.toggle.name'),
                    desc: SettingsTab.createFragmentWithHTML(
                        `<p>${i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line1')} ` +
                            `${i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line2')}</p>` +
                            `<p>${i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line3')} ` +
                            `${i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description.line4')}</p>`,
                    ),
                    render: this.withDocs(
                        this.withReload('useFilenameAsScheduledDate', (setting, refreshReloadButton) => {
                            setting.addToggle((toggle) => {
                                toggle.setValue(getSettings().useFilenameAsScheduledDate).onChange(async (value) => {
                                    updateSettings({ useFilenameAsScheduledDate: value });
                                    await this.plugin.saveSettings();
                                    // Re-evaluate the 'visible' predicates of the dependent rows.
                                    if (requireApiVersion('1.13.0')) {
                                        this.refreshDomState();
                                    }
                                    refreshReloadButton();
                                });
                            });
                        }),
                        'https://publish.obsidian.md/tasks/Getting+Started/Use+Filename+as+Default+Date',
                    ),
                },
                {
                    name: i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.name'),
                    desc: i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.description.line1'),
                    visible: () => getSettings().useFilenameAsScheduledDate,
                    render: this.withDocs(
                        this.withReload('filenameAsScheduledDateFormat', (setting, refreshReloadButton) => {
                            setting.addText((text) => {
                                text.setPlaceholder(
                                    i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.placeholder'),
                                )
                                    .setValue(getSettings().filenameAsScheduledDateFormat)
                                    .onChange(async (value) => {
                                        updateSettings({ filenameAsScheduledDateFormat: value });
                                        await this.plugin.saveSettings();
                                        refreshReloadButton();
                                    });
                            });
                        }),
                        'https://momentjs.com/docs/#/displaying/format/',
                    ),
                },
                {
                    name: i18n.t('settings.datesFromFileNames.scheduledDate.folders.name'),
                    desc: i18n.t('settings.datesFromFileNames.scheduledDate.folders.description'),
                    visible: () => getSettings().useFilenameAsScheduledDate,
                    render: this.withReload('filenameAsDateFolders', (setting, refreshReloadButton) => {
                        setting.addText((input) => {
                            input
                                .setValue(SettingsTab.renderFolderArray(getSettings().filenameAsDateFolders))
                                .onChange(async (value) => {
                                    const folders = SettingsTab.parseCommaSeparatedFolders(value);
                                    updateSettings({ filenameAsDateFolders: folders });
                                    await this.plugin.saveSettings();
                                    refreshReloadButton();
                                });
                        });
                    }),
                },
            ],
        };
    }

    // ---- Recurring tasks --------------------------------------------------

    private recurringTasksGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.recurringTasks.heading'),
            items: [
                {
                    name: i18n.t('settings.recurringTasks.nextLine.name'),
                    desc: i18n.t('settings.recurringTasks.nextLine.description'),
                    render: this.renderToggleWithDocs(
                        'recurrenceOnNextLine',
                        'https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks',
                    ),
                },
                {
                    name: i18n.t('settings.recurringTasks.removeScheduledDate.name'),
                    desc: SettingsTab.createFragmentWithHTML(
                        `<p>${i18n.t('settings.recurringTasks.removeScheduledDate.description.line1')}</p>` +
                            `<p>${i18n.t('settings.recurringTasks.removeScheduledDate.description.line2')}</p>`,
                    ),
                    render: this.renderToggleWithDocs(
                        'removeScheduledDateOnRecurrence',
                        'https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks',
                    ),
                },
            ],
        };
    }

    // ---- Task entry (auto-suggest + dialog access keys) -------------------

    private taskEntryGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.taskEntry.heading'),
            items: [
                {
                    name: i18n.t('settings.autoSuggest.toggle.name'),
                    desc: i18n.t('settings.autoSuggest.toggle.description'),
                    render: this.withDocs(
                        this.withReload('autoSuggestInEditor', (setting, refreshReloadButton) => {
                            setting.addToggle((toggle) => {
                                toggle.setValue(getSettings().autoSuggestInEditor).onChange(async (value) => {
                                    updateSettings({ autoSuggestInEditor: value });
                                    await this.plugin.saveSettings();
                                    // Re-evaluate the 'visible' predicates of the dependent rows.
                                    if (requireApiVersion('1.13.0')) {
                                        this.refreshDomState();
                                    }
                                    refreshReloadButton();
                                });
                            });
                        }),
                        'https://publish.obsidian.md/tasks/Getting+Started/Auto-Suggest',
                    ),
                },
                {
                    name: i18n.t('settings.autoSuggest.minLength.name'),
                    desc: i18n.t('settings.autoSuggest.minLength.description'),
                    visible: () => getSettings().autoSuggestInEditor,
                    render: this.withReload('autoSuggestMinMatch', (setting, refreshReloadButton) => {
                        setting.addSlider((slider) => {
                            slider
                                .setLimits(0, 3, 1)
                                .setValue(getSettings().autoSuggestMinMatch)
                                .onChange(async (value) => {
                                    updateSettings({ autoSuggestMinMatch: value });
                                    await this.plugin.saveSettings();
                                    refreshReloadButton();
                                });
                        });
                    }),
                },
                {
                    name: i18n.t('settings.autoSuggest.maxSuggestions.name'),
                    desc: i18n.t('settings.autoSuggest.maxSuggestions.description'),
                    visible: () => getSettings().autoSuggestInEditor,
                    render: this.withReload('autoSuggestMaxItems', (setting, refreshReloadButton) => {
                        setting.addSlider((slider) => {
                            slider
                                .setLimits(3, 20, 1)
                                .setValue(getSettings().autoSuggestMaxItems)
                                .onChange(async (value) => {
                                    updateSettings({ autoSuggestMaxItems: value });
                                    await this.plugin.saveSettings();
                                    refreshReloadButton();
                                });
                        });
                    }),
                },
                {
                    name: i18n.t('settings.dialogs.accessKeys.name'),
                    desc: i18n.t('settings.dialogs.accessKeys.description'),
                    render: this.renderToggleWithDocs(
                        'provideAccessKeys',
                        'https://publish.obsidian.md/tasks/Getting+Started/Create+or+edit+Task#Keyboard+shortcuts',
                    ),
                },
            ],
        };
    }

    public display(): void {
        const { containerEl } = this;

        containerEl.empty();
        this.containerEl.addClass('tasks-settings');

        new Setting(containerEl)
            .setName(i18n.t('settings.format.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.format.description.line1')}</p>` +
                        `<p>${i18n.t('settings.format.description.line2')}</p>` +
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>` +
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
                    .onChange(
                        debounce(
                            async (value) => {
                                updateSettings({ globalFilter: value });
                                GlobalFilter.getInstance().set(value);
                                await this.plugin.saveSettings();
                                setSettingVisibility(globalFilterHidden, value.length > 0);

                                this.events.triggerReloadVault();
                            },
                            500,
                            true,
                        ),
                    );
            });

        globalFilterHidden = new Setting(containerEl)
            .setName(i18n.t('settings.globalFilter.removeFilter.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.globalFilter.removeFilter.description')}</p>` +
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>`,
                ),
            )
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

                            this.events.triggerReloadOpenSearchResults();
                        });
                }),
        );

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.searches.heading')).setHeading();
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName(i18n.t('settings.searches.enableCustomSearches.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.searches.enableCustomSearches.description.line1', {
                        filterByFunction: '<code>filter by function</code>',
                        sortByFunction: '<code>sort by function</code>',
                        groupByFunction: '<code>group by function</code>',
                    })}</p>` +
                        `<p>${i18n.t('settings.searches.enableCustomSearches.description.line2')}</p>` +
                        `<p><b>${i18n.t('settings.searches.enableCustomSearches.description.line3')}</b></p>` +
                        `<p>${i18n.t('settings.searches.enableCustomSearches.description.line4')}</p>`,
                ),
            )
            .addToggle((toggle) => {
                toggle.setValue(EnableJsInTasksQueries.getInstance().get()).onChange(async (value) => {
                    EnableJsInTasksQueries.getInstance().set(value);

                    this.events.triggerReloadOpenSearchResults();
                });
            });

        // ---------------------------------------------------------------------------
        new Setting(containerEl).setName(i18n.t('settings.searchResults.heading')).setHeading();
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName(i18n.t('settings.searchResults.taskCountLocation.name'))
            .setDesc(i18n.t('settings.searchResults.taskCountLocation.description'))
            .addDropdown((dropdown) => {
                dropdown.addOption('top', i18n.t('settings.searchResults.taskCountLocation.options.top'));
                dropdown.addOption('bottom', i18n.t('settings.searchResults.taskCountLocation.options.bottom'));
                dropdown.setValue(getSettings().searchResults.taskCountLocation).onChange(async (value) => {
                    updateSettings({ searchResults: { taskCountLocation: value as 'top' | 'bottom' } });
                    await this.plugin.saveSettings();

                    this.events.triggerReloadOpenSearchResults();
                });
            });

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
                        '</p><p>' +
                        i18n.t('settings.changeRequiresRestart') +
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
                        '</p><p>' +
                        i18n.t('settings.changeRequiresRestart') +
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
        settingsJson.forEach((heading: HeadingConfiguration) => {
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
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>` +
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
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>` +
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
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.datesFromFileNames.scheduledDate.folders.description')}</p>` +
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>`,
                ),
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
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>` +
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
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.autoSuggest.minLength.description')}</p>` +
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>`,
                ),
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

        autoSuggestMaximumSuggestions = new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.maxSuggestions.name'))
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    `<p>${i18n.t('settings.autoSuggest.maxSuggestions.description')}</p>` +
                        `<p>${i18n.t('settings.changeRequiresRestart')}</p>`,
                ),
            )
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
        heading: HeadingConfiguration,
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
            void this.plugin.saveSettings();
        };
        const summary = detailsContainer.createEl('summary');
        new Setting(summary).setHeading().setName(heading.text);
        summary.createDiv('collapser').createDiv('handle');

        // detailsContainer.createEl(heading.level as keyof HTMLElementTagNameMap, { text: heading.text });

        if (heading.notice !== null) {
            if (heading.notice.html !== null) {
                new Setting(detailsContainer).setDesc(SettingsTab.createFragmentWithHTML(heading.notice.html));
            }
        }

        // This will process all the settings from settingsConfiguration.json and render
        // them out reducing the duplication of the code in this file. This will become
        // more important as features are being added over time.
        heading.settings.forEach((setting: SettingConfiguration) => {
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
                    text: setting.notice.text ?? '',
                });
                if (setting.notice.html !== null) {
                    notice.append(sanitizeHTMLToDom(setting.notice.html));
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
                .onClick(() => {
                    StatusSettings.addStatus(
                        statusSettings.customStatuses,
                        new StatusConfiguration('', '', '', false, StatusType.TODO),
                    );
                    updateAndSaveStatusSettings(statusSettings, settings);
                });
        });
        setting.infoEl.remove();

        /* -------------------- Add all Status types supported by ... buttons -------------------- */
        for (const { name, collection } of getThemeCollections()) {
            const addStatusesSupportedByThisTheme = new Setting(containerEl).addButton((button) => {
                const label = i18n.t('settings.statuses.collections.buttons.addCollection.name', {
                    themeName: name,
                    numberOfStatuses: collection.length,
                });
                button.setButtonText(label).onClick(() => {
                    addCustomStatesToSettings(collection, statusSettings, settings);
                });
            });
            addStatusesSupportedByThisTheme.infoEl.remove();
        }

        /* -------------------- 'Add All Unknown Status Types' button -------------------- */
        const addAllUnknownStatuses = new Setting(containerEl).addButton((button) => {
            button
                .setButtonText(i18n.t('settings.statuses.customStatuses.buttons.addAllUnknown.name'))
                .setCta()
                .onClick(() => {
                    const tasks = this.plugin.getTasks();
                    const allStatuses = tasks.map((task) => {
                        return task.status;
                    });
                    const unknownStatuses = StatusRegistry.getInstance().findUnknownStatuses(allStatuses);
                    if (unknownStatuses.length === 0) {
                        return;
                    }
                    unknownStatuses.forEach((s) => {
                        StatusSettings.addStatus(statusSettings.customStatuses, s);
                    });
                    updateAndSaveStatusSettings(statusSettings, settings);
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
                    updateAndSaveStatusSettings(statusSettings, settings);
                });
        });
        clearCustomStatuses.infoEl.remove();
    }
}

/**
 * Human-readable label for a {@link StatusType}. The enum values are
 * SCREAMING_SNAKE_CASE for storage; we surface friendlier titles in the UI.
 */
export function humanizeStatusType(type: StatusType): string {
    switch (type) {
        case StatusType.TODO:
            return i18n.t('settings.statuses.types.todo');
        case StatusType.IN_PROGRESS:
            return i18n.t('settings.statuses.types.inProgress');
        case StatusType.ON_HOLD:
            return i18n.t('settings.statuses.types.onHold');
        case StatusType.DONE:
            return i18n.t('settings.statuses.types.done');
        case StatusType.CANCELLED:
            return i18n.t('settings.statuses.types.cancelled');
        case StatusType.NON_TASK:
            return i18n.t('settings.statuses.types.nonTask');
        case StatusType.EMPTY:
            return i18n.t('settings.statuses.types.empty');
    }
}

/**
 * Returns the named theme collections used to seed common status sets.
 * Shared between the imperative `display()` path and the declarative
 * statuses page's "Import from theme" menu.
 */
function getThemeCollections(): { name: string; collection: StatusCollection }[] {
    return [
        // Light and Dark themes - alphabetical order
        {
            name: i18n.t('settings.statuses.collections.anuppuccinTheme'),
            collection: Themes.anuppuccinSupportedStatuses(),
        },
        { name: i18n.t('settings.statuses.collections.auraTheme'), collection: Themes.auraSupportedStatuses() },
        { name: i18n.t('settings.statuses.collections.borderTheme'), collection: Themes.borderSupportedStatuses() },
        {
            name: i18n.t('settings.statuses.collections.ebullientworksTheme'),
            collection: Themes.ebullientworksSupportedStatuses(),
        },
        {
            name: i18n.t('settings.statuses.collections.itsThemeAndSlrvbCheckboxes'),
            collection: Themes.itsSupportedStatuses(),
        },
        { name: i18n.t('settings.statuses.collections.minimalTheme'), collection: Themes.minimalSupportedStatuses() },
        { name: i18n.t('settings.statuses.collections.thingsTheme'), collection: Themes.thingsSupportedStatuses() },
        // Dark only themes - alphabetical order
        { name: i18n.t('settings.statuses.collections.lytModeTheme'), collection: Themes.lytModeSupportedStatuses() },
    ];
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
                .onClick(() => {
                    if (StatusSettings.deleteStatus(statuses, statusType)) {
                        updateAndSaveStatusSettings(statusSettings, settings);
                    }
                });
        });
    }

    setting.addExtraButton((extra) => {
        extra
            .setIcon('pencil')
            .setTooltip('Edit')
            .onClick(() => {
                const modal = new CustomStatusModal(plugin, statusType, isCoreStatus);

                modal.onClose = () => {
                    if (modal.saved) {
                        if (StatusSettings.replaceStatus(statuses, statusType, modal.statusConfiguration())) {
                            updateAndSaveStatusSettings(statusSettings, settings);
                        }
                    }
                };

                modal.open();
            });
    });

    setting.infoEl.remove();
}

function addCustomStatesToSettings(
    supportedStatuses: StatusCollection,
    statusSettings: StatusSettings,
    settings: SettingsTab,
) {
    const notices = StatusSettings.bulkAddStatusCollection(statusSettings, supportedStatuses);

    notices.forEach((notice) => {
        new Notice(notice);
    });

    updateAndSaveStatusSettings(statusSettings, settings);
}

function updateAndSaveStatusSettings(statusTypes: StatusSettings, settings: SettingsTab) {
    updateSettings({
        statusSettings: statusTypes,
    });

    // Update the active statuses.
    // This saves the user from having to restart Obsidian in order to apply the changed status(es).
    StatusSettings.applyToStatusRegistry(statusTypes, StatusRegistry.getInstance());

    settings.saveSettingsAndRebuildSettingsTab();
    settings.refreshStatusesReloadNotice();
}

function makeMultilineTextSetting(setting: Setting) {
    const { settingEl, infoEl, controlEl } = setting;
    const textEl: HTMLElement | null = controlEl.querySelector('textarea');

    // Not a setting with a text field
    if (textEl === null) {
        return;
    }

    settingEl.addClass('tasks-setting-multiline-text');
    infoEl.addClass('tasks-setting-multiline-text-info');
    textEl.addClass('tasks-setting-multiline-text-textarea');
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
