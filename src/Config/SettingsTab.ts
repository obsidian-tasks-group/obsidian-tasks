import {
    ButtonComponent,
    Menu,
    Modal,
    Notice,
    PluginSettingTab,
    Setting,
    type SettingDefinition,
    type SettingDefinitionItem,
    type SettingGroupItem,
    type ToggleComponent,
    debounce,
    requireApiVersion,
    sanitizeHTMLToDom,
} from 'obsidian';
import { StatusConfiguration, StatusType } from '../Statuses/StatusConfiguration';
import type TasksPlugin from '../main';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import type { StatusCollection } from '../Statuses/StatusCollection';
import { createStatusRegistryReport } from '../Statuses/StatusRegistryReport';
import { i18n } from '../i18n/i18n';
import type { TasksEvents } from '../Obsidian/TasksEvents';
import { refreshEditorDecorations } from '../Obsidian/EditorDecorations';
import { htmlEncodeString } from '../lib/HTMLCharacterEntities';
import * as Themes from './Themes';
import { type Settings, TASK_FORMATS, getSettings, updateSettings } from './Settings';
import { GlobalFilter } from './GlobalFilter';
import { StatusSettings } from './StatusSettings';

import { CustomStatusModal } from './CustomStatusModal';
import { ConfirmModal } from './ConfirmModal';
import { GlobalQuery } from './GlobalQuery';
import { GlobalQueryModal } from './GlobalQueryModal';
import { PresetsSettingsUI } from './PresetsSettingsUI';
import { EnableJsInTasksQueries } from './EnableJsInTasksQueries';
import { humanizeStatusType } from './StatusTypeLabels';

export { humanizeStatusType } from './StatusTypeLabels';

/**
 * A snapshot of the settings when the plugin loaded.
 * {@link SettingsTab.withReload} compares current values against these.
 */
let settingsAtPluginLoad: Settings | null = null;

function getSettingsAtPluginLoad(): Settings {
    settingsAtPluginLoad ??= JSON.parse(JSON.stringify(getSettings()));
    return settingsAtPluginLoad as Settings;
}

function para(text: unknown): string {
    return `<p>${text}</p>`;
}

function paras(texts: unknown[]): string {
    return texts.map((text) => para(text)).join('');
}

function link(url: string, anchor: string): string {
    return `<a href="${url}">${anchor}</a>`;
}

function code(text: string): string {
    return `<code>${text}</code>`;
}

const docs = {
    taskFormats: 'https://publish.obsidian.md/tasks/Reference/Task+Formats/About+Task+Formats',
    globalFilter: 'https://publish.obsidian.md/tasks/Getting+Started/Global+Filter',
    statuses: 'https://publish.obsidian.md/tasks/Getting+Started/Statuses',
    globalQuery: 'https://publish.obsidian.md/tasks/Queries/Global+Query',
    presets: 'https://publish.obsidian.md/tasks/Queries/Presets',
    customSearches: 'https://publish.obsidian.md/tasks/Scripting/JavaScript+in+Tasks+Queries',
    createdDate: 'https://publish.obsidian.md/tasks/Getting+Started/Dates#Created+date',
    doneDate: 'https://publish.obsidian.md/tasks/Getting+Started/Dates#Done+date',
    cancelledDate: 'https://publish.obsidian.md/tasks/Getting+Started/Dates#Cancelled+date',
    filenameDates: 'https://publish.obsidian.md/tasks/Getting+Started/Use+Filename+as+Default+Date',
    momentFormats: 'https://momentjs.com/docs/#/displaying/format/',
    recurringTasks: 'https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks',
    autoSuggest: 'https://publish.obsidian.md/tasks/Getting+Started/Auto-Suggest',
    accessKeys: 'https://publish.obsidian.md/tasks/Getting+Started/Create+or+edit+Task#Keyboard+shortcuts',
} as const;

/**
 * The plugin's settings tab, with two implementations of the UI:
 *
 * - {@link getSettingDefinitions} — the declarative API, used by Obsidian 1.13.0 and later.
 * - {@link display} — the imperative fallback, used by older Obsidian versions.
 *
 * Obsidian picks the right path per host, so BOTH implementations must be
 * updated whenever a setting is added, removed or changed.
 * Both use the same sections and text.
 */
export class SettingsTab extends PluginSettingTab {
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

        window.requestAnimationFrame(() => {
            this.containerEl.scrollTo({ top: previousDistanceFromTop });
        });
    }

    /**
     * Re-evaluate the 'visible' predicates of rows that depend on another setting.
     */
    private refreshDependentRows(): void {
        if (requireApiVersion('1.13.0')) {
            this.refreshDomState();
        }
    }

    // -----------------------------------------------------------------------
    // Text shared by both implementations
    // -----------------------------------------------------------------------

    private static taskFormatDescription(): string {
        return paras([i18n.t('settings.format.description'), i18n.t('settings.format.oneFormatOnly')]);
    }

    private static globalFilterDescription(): string {
        return paras([
            i18n.t('settings.globalFilter.filter.description'),
            i18n.t('settings.globalFilter.filter.example', { example: code('#task') }),
        ]);
    }

    private static statusesDescription(): string {
        return paras([i18n.t('settings.statuses.description.core'), i18n.t('settings.statuses.description.custom')]);
    }

    private static presetsDescription(): string {
        return i18n.t('settings.presets.description', {
            instruction1: code('preset name'),
            instruction2: code('{{preset.name}}'),
        });
    }

    private static customSearchesDescription(): string {
        return i18n.t('settings.queries.javaScript.description', {
            filterByFunction: code('filter by function'),
            sortByFunction: code('sort by function'),
            groupByFunction: code('group by function'),
        });
    }

    private static filenameDateDescription(): string {
        return i18n.t('settings.datesFromFileNames.scheduledDate.toggle.description', {
            format1: code('YYYY-MM-DD'),
            format2: code('YYYYMMDD'),
        });
    }

    /**
     * A one-line summary of the global query.
     */
    private static globalQuerySummary(): string {
        const firstLine = getSettings()
            .globalQuery.split('\n')
            .map((line) => line.trim())
            .find((line) => line !== '');
        if (firstLine === undefined) {
            return i18n.t('settings.queries.globalQuery.notSet');
        }
        const lineCount = getSettings()
            .globalQuery.split('\n')
            .filter((line) => line.trim() !== '').length;
        // The summary is shown as HTML, so escape the user's text.
        const firstLineHtml = code(htmlEncodeString(firstLine));
        return lineCount > 1
            ? i18n.t('settings.queries.globalQuery.summaryMultiline', {
                  firstLine: firstLineHtml,
                  count: lineCount - 1,
              })
            : i18n.t('settings.queries.globalQuery.summary', { firstLine: firstLineHtml });
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
     * only takes after the host window reloads.
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
                .setTooltip(i18n.t('settings.reloadToApply'))
                .setCta()
                .onClick(() => window.location.reload());
            // Put the button before the control, to match Obsidian's own 'Relaunch' buttons.
            setting.controlEl.prepend(btn.buttonEl);
        });
        return button;
    }

    public getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            this.generalGroup(),
            this.queriesGroup(),
            this.datesGroup(),
            this.recurringTasksGroup(),
            this.editingGroup(),
            this.displayGroup(),
        ];
    }

    // ---- General ------------------------------------------------------------

    private generalGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.general.heading'),
            items: [
                {
                    name: i18n.t('settings.format.name'),
                    aliases: [i18n.t('settings.general.heading')],
                    desc: SettingsTab.createFragmentWithHTML(SettingsTab.taskFormatDescription()),
                    render: this.withDocs(
                        this.withReload('taskFormat', (setting, refreshReloadButton) => {
                            setting.addDropdown((dropdown) => {
                                for (const key of Object.keys(TASK_FORMATS) as (keyof TASK_FORMATS)[]) {
                                    dropdown.addOption(key, TASK_FORMATS[key].getDisplayName());
                                }
                                dropdown.setValue(getSettings().taskFormat).onChange(async (value) => {
                                    updateSettings({ taskFormat: value as keyof TASK_FORMATS });
                                    await this.plugin.saveSettings();
                                    this.refreshDependentRows();
                                    refreshReloadButton();
                                });
                            });
                        }),
                        docs.taskFormats,
                    ),
                },
                {
                    name: i18n.t('settings.globalFilter.filter.name'),
                    desc: SettingsTab.createFragmentWithHTML(SettingsTab.globalFilterDescription()),
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
                                            this.refreshDependentRows();
                                            this.events.triggerReloadVault();
                                        },
                                        500,
                                        true,
                                    ),
                                );
                        });
                    }, docs.globalFilter),
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
                this.statusesPage(),
            ],
        };
    }

    // ---- Statuses (sub-page) ---------------------------------------------

    private statusesPage(): SettingGroupItem {
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
            desc: SettingsTab.createFragmentWithHTML(
                SettingsTab.statusesDescription() +
                    para(link(docs.statuses, i18n.t('settings.statuses.description.docsLink'))),
            ),
            displayValue: () =>
                String(
                    getSettings().statusSettings.coreStatuses.length +
                        getSettings().statusSettings.customStatuses.length,
                ),
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
                                        para(i18n.t('settings.statuses.coreStatuses.description')),
                                        docs.statuses,
                                    ),
                                ),
                    ],
                    items: statusSettings.coreStatuses.map((status) => statusRow(status, true)),
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
                                        paras([
                                            i18n.t('settings.statuses.description.custom'),
                                            i18n.t('settings.statuses.customStatuses.description'),
                                        ]),
                                        docs.statuses,
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
                        action: () => this.openAddStatusModal(),
                    },
                    items: statusSettings.customStatuses.map((status) => statusRow(status, false)),
                },
                {
                    type: 'list',
                    heading: i18n.t('settings.statuses.tools.heading'),
                    items: [
                        {
                            name: i18n.t('settings.statuses.tools.importFromTheme.name'),
                            desc: i18n.t('settings.statuses.tools.importFromTheme.description'),
                            searchable: false,
                            action: (el) => this.showImportFromThemeMenu(el),
                        },
                        {
                            name: i18n.t('settings.statuses.tools.addUnknown.name'),
                            desc: i18n.t('settings.statuses.tools.addUnknown.description'),
                            searchable: false,
                            action: () => this.addUnknownStatuses(),
                        },
                        {
                            name: i18n.t('settings.statuses.tools.report.name'),
                            desc: i18n.t('settings.statuses.tools.report.description'),
                            // List headings are not searchable, so this
                            // always-present row carries the page name as an alias.
                            aliases: [i18n.t('settings.statuses.heading')],
                            action: async () => {
                                await this.createStatusRegistryReport();
                            },
                        },
                        {
                            name: i18n.t('settings.statuses.tools.reset.name'),
                            desc: i18n.t('settings.statuses.tools.reset.description'),
                            searchable: false,
                            render: (setting) => {
                                setting.addButton((button) => {
                                    button
                                        .setButtonText(i18n.t('settings.statuses.tools.reset.confirm.button'))
                                        .setWarning()
                                        .onClick(() => this.confirmResetCustomStatuses());
                                });
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
     * The symbols of all statuses except `excluding`, so that the edit dialog can reject duplicates.
     */
    private static otherStatusSymbols(excluding: StatusConfiguration | null): string[] {
        const { statusSettings } = getSettings();
        const symbols = [...statusSettings.coreStatuses, ...statusSettings.customStatuses].map(
            (status) => status.symbol,
        );
        // getSettings() creates new status objects, so remove the edited status by its symbol, not by identity.
        if (excluding !== null) {
            const index = symbols.indexOf(excluding.symbol);
            if (index !== -1) {
                symbols.splice(index, 1);
            }
        }
        return symbols;
    }

    private openAddStatusModal(): void {
        const draft = new StatusConfiguration('', '', '', false, StatusType.TODO);
        const modal = new CustomStatusModal(this.plugin, draft, false, SettingsTab.otherStatusSymbols(null), true);
        modal.onClose = () => {
            if (!modal.saved) {
                return;
            }
            const { statusSettings: current } = getSettings();
            StatusSettings.addStatus(current.customStatuses, modal.statusConfiguration());
            updateAndSaveStatusSettings(current, this);
        };
        modal.open();
    }

    private addUnknownStatuses(): void {
        const { statusSettings: current } = getSettings();
        const tasks = this.plugin.getTasks();
        const unknownStatuses = StatusRegistry.getInstance().findUnknownStatuses(tasks.map((task) => task.status));
        if (unknownStatuses.length === 0) {
            new Notice(i18n.t('settings.statuses.tools.addUnknown.noneFound'));
            return;
        }
        unknownStatuses.forEach((s) => {
            StatusSettings.addStatus(current.customStatuses, s);
        });
        updateAndSaveStatusSettings(current, this);
        new Notice(i18n.t('settings.statuses.tools.addUnknown.added', { count: unknownStatuses.length }));
    }

    private confirmResetCustomStatuses(): void {
        new ConfirmModal(this.app, {
            title: i18n.t('settings.statuses.tools.reset.confirm.title'),
            paragraphs: [i18n.t('settings.statuses.tools.reset.confirm.message')],
            confirmText: i18n.t('settings.statuses.tools.reset.confirm.button'),
            destructive: true,
            onDecision: (confirmed) => {
                if (!confirmed) {
                    return;
                }
                const { statusSettings: current } = getSettings();
                StatusSettings.resetAllCustomStatuses(current);
                updateAndSaveStatusSettings(current, this);
            },
        }).open();
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
     * Lay out a status row as "[/] In progress (type) ... Next → [x]".
     */
    private static decorateStatusRow(setting: Setting, status: StatusConfiguration): void {
        const { coreStatuses, customStatuses } = getSettings().statusSettings;
        const next = [...coreStatuses, ...customStatuses].find((s) => s.symbol === status.nextStatusSymbol);
        setting.settingEl.addClass('tasks-status-row');
        setting.nameEl.createEl('code', {
            cls: 'tasks-status-symbol',
            text: `[${status.symbol || ' '}]`,
            prepend: true,
        });
        setting.nameEl.createSpan({ cls: 'flair', text: humanizeStatusType(status.type) });
        const nextEl = setting.controlEl.createSpan({ cls: 'tasks-status-next' });
        if (next?.name) {
            nextEl.setAttribute('aria-label', next.name);
        }
        nextEl.createSpan({ cls: 'tasks-status-label', text: `${i18n.t('settings.statuses.row.next')} →` });
        nextEl.createEl('code', { cls: 'tasks-status-symbol', text: `[${status.nextStatusSymbol || ' '}]` });
    }

    /**
     * One list row for a status: its symbol, name, type and next symbol.
     * Deletion is wired by the list's `onDelete`.
     */
    private statusRow(status: StatusConfiguration, isCoreStatus: boolean): SettingDefinition {
        return {
            name: status.name || i18n.t('settings.statuses.unnamed'),
            render: (setting) => {
                SettingsTab.decorateStatusRow(setting, status);
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
        const modal = new CustomStatusModal(this.plugin, status, isCoreStatus, SettingsTab.otherStatusSymbols(status));
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
        const title = i18n.t('settings.statuses.tools.report.noteTitle');

        // Generate a new file unique file name, in the root of the vault
        const now = window.moment();
        const formattedDateTime = now.format('YYYY-MM-DD HH-mm-ss');
        const filename = `Tasks Plugin - ${title} ${formattedDateTime}.md`;

        // Create the report
        const version = this.plugin.manifest.version;
        const fileContent = createStatusRegistryReport(statusSettings, StatusRegistry.getInstance(), title, version);

        // Save the file, and open it
        const file = await this.app.vault.create(filename, fileContent);
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.openFile(file);
    }

    // ---- Queries ----------------------------------------------------------

    private queriesGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.queries.heading'),
            items: [
                {
                    name: i18n.t('settings.queries.globalQuery.name'),
                    aliases: [i18n.t('settings.queries.heading')],
                    desc: SettingsTab.createFragmentWithHTML(
                        paras([i18n.t('settings.queries.globalQuery.description'), SettingsTab.globalQuerySummary()]),
                    ),
                    render: this.withDocs((setting) => {
                        setting.addExtraButton((btn) =>
                            btn
                                .setIcon('pencil')
                                .setTooltip(i18n.t('common.edit'))
                                .onClick(() => this.openGlobalQueryModal()),
                        );
                    }, docs.globalQuery),
                },
                this.presetsPage(),
                {
                    name: i18n.t('settings.queries.javaScript.name'),
                    desc: SettingsTab.createFragmentWithHTML(SettingsTab.customSearchesDescription()),
                    render: this.withDocs(
                        (setting) => this.renderEnableCustomSearchesToggle(setting),
                        docs.customSearches,
                    ),
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
            // Update the summary of the global query.
            this.rebuildSettingsTab();
        }).open();
    }

    private presetsPage(): SettingGroupItem {
        return {
            type: 'page',
            name: i18n.t('settings.presets.name'),
            desc: SettingsTab.createFragmentWithHTML(
                paras([SettingsTab.presetsDescription(), link(docs.presets, i18n.t('settings.seeTheDocumentation'))]),
            ),
            displayValue: () => String(Object.keys(getSettings().presets).length),
            items: this.presetsSettingsUI.getPresetsDefinitions(() => this.rebuildSettingsTab()),
        };
    }

    private renderEnableCustomSearchesToggle(setting: Setting): void {
        setting.addToggle((toggle) => {
            toggle.setValue(EnableJsInTasksQueries.getInstance().get()).onChange((value) => {
                if (!value) {
                    // Turning OFF: no confirmation needed. (This also runs when a cancelled confirmation resets the toggle.)
                    if (!EnableJsInTasksQueries.getInstance().get()) {
                        return;
                    }
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
     * Ask the user to acknowledge the risks of allowing JavaScript in queries.
     */
    private confirmEnableCustomSearches(callback: (confirmed: boolean) => void): void {
        new ConfirmModal(this.app, {
            title: i18n.t('settings.queries.javaScript.name'),
            paragraphs: [i18n.t('settings.queries.javaScript.confirm.risk')],
            warning: i18n.t('settings.queries.javaScript.confirm.trust'),
            acknowledgement: i18n.t('settings.queries.javaScript.confirm.acknowledge'),
            confirmText: i18n.t('settings.queries.javaScript.confirm.allow'),
            onDecision: callback,
        }).open();
    }

    // ---- Dates ------------------------------------------------------------

    private datesGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.dates.heading'),
            items: [
                {
                    name: i18n.t('settings.dates.createdDate.name'),
                    aliases: [i18n.t('settings.dates.heading')],
                    desc: i18n.t('settings.dates.createdDate.description'),
                    render: this.renderToggleWithDocs('setCreatedDate', docs.createdDate),
                },
                {
                    name: i18n.t('settings.dates.doneDate.name'),
                    desc: i18n.t('settings.dates.doneDate.description'),
                    render: this.renderToggleWithDocs('setDoneDate', docs.doneDate),
                },
                {
                    name: i18n.t('settings.dates.cancelledDate.name'),
                    desc: i18n.t('settings.dates.cancelledDate.description'),
                    render: this.renderToggleWithDocs('setCancelledDate', docs.cancelledDate),
                },
                {
                    name: i18n.t('settings.datesFromFileNames.scheduledDate.toggle.name'),
                    aliases: [i18n.t('settings.datesFromFileNames.heading')],
                    desc: SettingsTab.createFragmentWithHTML(SettingsTab.filenameDateDescription()),
                    render: this.withDocs(
                        this.withReload('useFilenameAsScheduledDate', (setting, refreshReloadButton) => {
                            setting.addToggle((toggle) => {
                                toggle.setValue(getSettings().useFilenameAsScheduledDate).onChange(async (value) => {
                                    updateSettings({ useFilenameAsScheduledDate: value });
                                    await this.plugin.saveSettings();
                                    this.refreshDependentRows();
                                    refreshReloadButton();
                                });
                            });
                        }),
                        docs.filenameDates,
                    ),
                },
                {
                    name: i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.name'),
                    desc: i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.description'),
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
                        docs.momentFormats,
                    ),
                },
                {
                    name: i18n.t('settings.datesFromFileNames.scheduledDate.folders.name'),
                    desc: i18n.t('settings.datesFromFileNames.scheduledDate.folders.description'),
                    visible: () => getSettings().useFilenameAsScheduledDate,
                    render: this.withReload('filenameAsDateFolders', (setting, refreshReloadButton) => {
                        setting.addText((input) => {
                            input
                                .setPlaceholder(i18n.t('settings.datesFromFileNames.scheduledDate.folders.placeholder'))
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
                    aliases: [i18n.t('settings.recurringTasks.heading')],
                    desc: i18n.t('settings.recurringTasks.nextLine.description'),
                    render: this.renderToggleWithDocs('recurrenceOnNextLine', docs.recurringTasks),
                },
                {
                    name: i18n.t('settings.recurringTasks.removeScheduledDate.name'),
                    desc: i18n.t('settings.recurringTasks.removeScheduledDate.description'),
                    render: this.renderToggleWithDocs('removeScheduledDateOnRecurrence', docs.recurringTasks),
                },
            ],
        };
    }

    // ---- Editing (auto-suggest) -------------------------------------------

    private editingGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.editing.heading'),
            items: [
                {
                    name: i18n.t('settings.autoSuggest.toggle.name'),
                    aliases: [i18n.t('settings.editing.heading')],
                    desc: i18n.t('settings.autoSuggest.toggle.description'),
                    render: this.withDocs(
                        this.withReload('autoSuggestInEditor', (setting, refreshReloadButton) => {
                            setting.addToggle((toggle) => {
                                toggle.setValue(getSettings().autoSuggestInEditor).onChange(async (value) => {
                                    updateSettings({ autoSuggestInEditor: value });
                                    await this.plugin.saveSettings();
                                    this.refreshDependentRows();
                                    refreshReloadButton();
                                });
                            });
                        }),
                        docs.autoSuggest,
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
            ],
        };
    }

    // ---- Display ------------------------------------------------------------

    private async setSignifierDisplay(value: 'icons' | 'emoji') {
        updateSettings({ signifierDisplay: value });
        await this.plugin.saveSettings();
        this.refreshDependentRows();
        this.events.triggerReloadOpenSearchResults();
        refreshEditorDecorations(this.app);
    }

    /**
     * Whether 'Render properties in Live Preview' has any effect.
     */
    private static editorPropertiesSettingApplies(): boolean {
        const { signifierDisplay, taskFormat } = getSettings();
        return signifierDisplay === 'icons' || taskFormat === 'dataview';
    }

    private async setShowIconsInEditor(value: boolean) {
        updateSettings({ showIconsInEditor: value });
        await this.plugin.saveSettings();
        refreshEditorDecorations(this.app);
    }

    private async setShowSubtaskProgress(value: boolean) {
        updateSettings({ showSubtaskProgress: value });
        await this.plugin.saveSettings();
        this.events.triggerReloadOpenSearchResults();
        refreshEditorDecorations(this.app);
    }

    private async setTaskCountLocation(value: 'top' | 'bottom') {
        updateSettings({ searchResults: { taskCountLocation: value } });
        await this.plugin.saveSettings();
        this.events.triggerReloadOpenSearchResults();
    }

    private displayGroup(): SettingDefinitionItem {
        return {
            type: 'group',
            heading: i18n.t('settings.display.heading'),
            items: [
                {
                    name: i18n.t('settings.display.signifiers.name'),
                    aliases: [i18n.t('settings.display.heading')],
                    desc: i18n.t('settings.display.signifiers.description'),
                    render: (setting) => {
                        setting.addDropdown((dropdown) => {
                            dropdown
                                .addOption('icons', i18n.t('settings.display.signifiers.options.icons'))
                                .addOption('emoji', i18n.t('settings.display.signifiers.options.emoji'))
                                .setValue(getSettings().signifierDisplay)
                                .onChange(async (value) => await this.setSignifierDisplay(value as 'icons' | 'emoji'));
                        });
                    },
                },
                {
                    name: i18n.t('settings.display.editorIcons.name'),
                    desc: i18n.t('settings.display.editorIcons.description'),
                    visible: () => SettingsTab.editorPropertiesSettingApplies(),
                    render: (setting) => {
                        setting.addToggle((toggle) => {
                            toggle
                                .setValue(getSettings().showIconsInEditor)
                                .onChange(async (value) => await this.setShowIconsInEditor(value));
                        });
                    },
                },
                {
                    name: i18n.t('settings.display.subtaskProgress.name'),
                    desc: i18n.t('settings.display.subtaskProgress.description'),
                    render: (setting) => {
                        setting.addToggle((toggle) => {
                            toggle
                                .setValue(getSettings().showSubtaskProgress)
                                .onChange(async (value) => await this.setShowSubtaskProgress(value));
                        });
                    },
                },
                {
                    name: i18n.t('settings.display.taskCountLocation.name'),
                    desc: i18n.t('settings.display.taskCountLocation.description'),
                    render: (setting) => {
                        setting.addDropdown((dropdown) => {
                            dropdown
                                .addOption('top', i18n.t('settings.display.taskCountLocation.options.top'))
                                .addOption('bottom', i18n.t('settings.display.taskCountLocation.options.bottom'))
                                .setValue(getSettings().searchResults.taskCountLocation)
                                .onChange(async (value) => await this.setTaskCountLocation(value as 'top' | 'bottom'));
                        });
                    },
                },
                {
                    name: i18n.t('settings.display.accessKeys.name'),
                    desc: i18n.t('settings.display.accessKeys.description'),
                    render: this.renderToggleWithDocs('provideAccessKeys', docs.accessKeys),
                },
            ],
        };
    }

    // -----------------------------------------------------------------------
    // Imperative settings UI (Obsidian before 1.13.0)
    // -----------------------------------------------------------------------

    public display(): void {
        const { containerEl } = this;

        containerEl.empty();
        this.containerEl.addClass('tasks-settings');

        this.displayGeneral(containerEl);
        this.displayStatuses(containerEl);
        this.displayQueries(containerEl);
        this.displayDates(containerEl);
        this.displayRecurringTasks(containerEl);
        this.displayEditing(containerEl);
        this.displayDisplay(containerEl);
    }

    /**
     * A description, with optional reload note and documentation link.
     */
    private static legacyDescription(
        html: string,
        { docsUrl, requiresReload }: { docsUrl?: string; requiresReload?: boolean } = {},
    ): DocumentFragment {
        let fullHtml = html.startsWith('<p>') ? html : para(html);
        if (requiresReload) {
            fullHtml += para(i18n.t('settings.reloadToApply'));
        }
        if (docsUrl) {
            fullHtml += para(link(docsUrl, i18n.t('settings.seeTheDocumentation')));
        }
        return SettingsTab.createFragmentWithHTML(fullHtml);
    }

    private displayGeneral(containerEl: HTMLElement) {
        new Setting(containerEl).setName(i18n.t('settings.general.heading')).setHeading();

        new Setting(containerEl)
            .setName(i18n.t('settings.format.name'))
            .setDesc(
                SettingsTab.legacyDescription(SettingsTab.taskFormatDescription(), {
                    docsUrl: docs.taskFormats,
                    requiresReload: true,
                }),
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

        let removeGlobalFilterSetting: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.globalFilter.filter.name'))
            .setDesc(
                SettingsTab.legacyDescription(SettingsTab.globalFilterDescription(), { docsUrl: docs.globalFilter }),
            )
            .addText((text) => {
                text.setPlaceholder(i18n.t('settings.globalFilter.filter.placeholder'))
                    .setValue(GlobalFilter.getInstance().get())
                    .onChange(
                        debounce(
                            async (value) => {
                                updateSettings({ globalFilter: value });
                                GlobalFilter.getInstance().set(value);
                                await this.plugin.saveSettings();
                                setSettingVisibility(removeGlobalFilterSetting, value.length > 0);

                                this.events.triggerReloadVault();
                            },
                            500,
                            true,
                        ),
                    );
            });

        removeGlobalFilterSetting = new Setting(containerEl)
            .setName(i18n.t('settings.globalFilter.removeFilter.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.globalFilter.removeFilter.description'), {
                    requiresReload: true,
                }),
            )
            .addToggle((toggle) => {
                toggle.setValue(getSettings().removeGlobalFilter).onChange(async (value) => {
                    updateSettings({ removeGlobalFilter: value });
                    GlobalFilter.getInstance().setRemoveGlobalFilter(value);
                    await this.plugin.saveSettings();
                });
            });
        setSettingVisibility(removeGlobalFilterSetting, getSettings().globalFilter.length > 0);
    }

    private displayStatuses(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName(i18n.t('settings.statuses.heading'))
            .setHeading()
            .setDesc(
                SettingsTab.legacyDescription(SettingsTab.statusesDescription(), {
                    docsUrl: docs.statuses,
                    requiresReload: true,
                }),
            );

        const { statusSettings } = getSettings();

        this.addCollapsibleSection(
            containerEl,
            i18n.t('settings.statuses.coreStatuses.heading'),
            i18n.t('settings.statuses.coreStatuses.description'),
            (sectionEl) => {
                statusSettings.coreStatuses.forEach((status) => {
                    this.createRowForTaskStatus(sectionEl, status, true);
                });
            },
        );

        this.addCollapsibleSection(
            containerEl,
            i18n.t('settings.statuses.customStatuses.heading'),
            i18n.t('settings.statuses.customStatuses.description'),
            (sectionEl) => {
                statusSettings.customStatuses.forEach((status) => {
                    this.createRowForTaskStatus(sectionEl, status, false);
                });

                const addStatus = new Setting(sectionEl).addButton((button) => {
                    button
                        .setButtonText(i18n.t('settings.statuses.buttons.addStatus'))
                        .setCta()
                        .onClick(() => this.openAddStatusModal());
                });
                addStatus.infoEl.remove();
            },
        );

        this.addCollapsibleSection(containerEl, i18n.t('settings.statuses.tools.heading'), null, (sectionEl) => {
            new Setting(sectionEl)
                .setName(i18n.t('settings.statuses.tools.importFromTheme.name'))
                .setDesc(i18n.t('settings.statuses.tools.importFromTheme.description'))
                .addButton((button) => {
                    button
                        .setButtonText(i18n.t('settings.statuses.tools.importFromTheme.button'))
                        .onClick(() => this.showImportFromThemeMenu(button.buttonEl));
                });

            new Setting(sectionEl)
                .setName(i18n.t('settings.statuses.tools.addUnknown.name'))
                .setDesc(i18n.t('settings.statuses.tools.addUnknown.description'))
                .addButton((button) => {
                    button
                        .setButtonText(i18n.t('settings.statuses.tools.addUnknown.button'))
                        .onClick(() => this.addUnknownStatuses());
                });

            new Setting(sectionEl)
                .setName(i18n.t('settings.statuses.tools.report.name'))
                .setDesc(i18n.t('settings.statuses.tools.report.description'))
                .addButton((button) => {
                    button
                        .setButtonText(i18n.t('settings.statuses.tools.report.button'))
                        .onClick(async () => await this.createStatusRegistryReport());
                });

            new Setting(sectionEl)
                .setName(i18n.t('settings.statuses.tools.reset.name'))
                .setDesc(i18n.t('settings.statuses.tools.reset.description'))
                .addButton((button) => {
                    button
                        .setButtonText(i18n.t('settings.statuses.tools.reset.confirm.button'))
                        .setWarning()
                        .onClick(() => this.confirmResetCustomStatuses());
                });
        });
    }

    private displayQueries(containerEl: HTMLElement) {
        new Setting(containerEl).setName(i18n.t('settings.queries.heading')).setHeading();

        makeMultilineTextSetting(
            new Setting(containerEl)
                .setName(i18n.t('settings.queries.globalQuery.name'))
                .setDesc(
                    SettingsTab.legacyDescription(i18n.t('settings.queries.globalQuery.description'), {
                        docsUrl: docs.globalQuery,
                    }),
                )
                .addTextArea((text) => {
                    text.inputEl.rows = 4;
                    text.setPlaceholder(i18n.t('settings.queries.globalQuery.placeholder'))
                        .setValue(getSettings().globalQuery)
                        .onChange(async (value) => {
                            updateSettings({ globalQuery: value });
                            GlobalQuery.getInstance().set(value);
                            await this.plugin.saveSettings();

                            this.events.triggerReloadOpenSearchResults();
                        });
                }),
        );

        new Setting(containerEl)
            .setName(i18n.t('settings.queries.javaScript.name'))
            .setDesc(
                SettingsTab.legacyDescription(SettingsTab.customSearchesDescription(), {
                    docsUrl: docs.customSearches,
                }),
            )
            .addToggle((toggle) => this.renderEnableCustomSearchesToggleLegacy(toggle));

        new Setting(containerEl)
            .setName(i18n.t('settings.presets.name'))
            .setHeading()
            .setDesc(SettingsTab.legacyDescription(SettingsTab.presetsDescription(), { docsUrl: docs.presets }));
        this.presetsSettingsUI.renderPresetsSettings(containerEl);
    }

    private renderEnableCustomSearchesToggleLegacy(toggle: ToggleComponent) {
        toggle.setValue(EnableJsInTasksQueries.getInstance().get()).onChange((value) => {
            if (!value) {
                if (!EnableJsInTasksQueries.getInstance().get()) {
                    return;
                }
                EnableJsInTasksQueries.getInstance().set(false);
                this.events.triggerReloadOpenSearchResults();
                return;
            }
            this.confirmEnableCustomSearches((confirmed) => this.applyCustomSearchesChoice(toggle, confirmed));
        });
    }

    private displayDates(containerEl: HTMLElement) {
        new Setting(containerEl).setName(i18n.t('settings.dates.heading')).setHeading();

        const dateToggles: {
            key: 'setCreatedDate' | 'setDoneDate' | 'setCancelledDate';
            i18nKey: string;
            docsUrl: string;
        }[] = [
            { key: 'setCreatedDate', i18nKey: 'createdDate', docsUrl: docs.createdDate },
            { key: 'setDoneDate', i18nKey: 'doneDate', docsUrl: docs.doneDate },
            { key: 'setCancelledDate', i18nKey: 'cancelledDate', docsUrl: docs.cancelledDate },
        ];
        for (const { key, i18nKey, docsUrl } of dateToggles) {
            new Setting(containerEl)
                .setName(i18n.t(`settings.dates.${i18nKey}.name`))
                .setDesc(SettingsTab.legacyDescription(i18n.t(`settings.dates.${i18nKey}.description`), { docsUrl }))
                .addToggle((toggle) => {
                    toggle.setValue(getSettings()[key]).onChange(async (value) => {
                        updateSettings({ [key]: value });
                        await this.plugin.saveSettings();
                    });
                });
        }

        let scheduledDateExtraFormat: Setting | null = null;
        let scheduledDateFolders: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.datesFromFileNames.scheduledDate.toggle.name'))
            .setDesc(
                SettingsTab.legacyDescription(SettingsTab.filenameDateDescription(), {
                    docsUrl: docs.filenameDates,
                    requiresReload: true,
                }),
            )
            .addToggle((toggle) => {
                toggle.setValue(getSettings().useFilenameAsScheduledDate).onChange(async (value) => {
                    updateSettings({ useFilenameAsScheduledDate: value });
                    setSettingVisibility(scheduledDateExtraFormat, value);
                    setSettingVisibility(scheduledDateFolders, value);
                    await this.plugin.saveSettings();
                });
            });

        scheduledDateExtraFormat = new Setting(containerEl)
            .setName(i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.name'))
            .setDesc(
                SettingsTab.legacyDescription(
                    i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.description'),
                    { docsUrl: docs.momentFormats, requiresReload: true },
                ),
            )
            .addText((text) => {
                text.setPlaceholder(i18n.t('settings.datesFromFileNames.scheduledDate.extraFormat.placeholder'))
                    .setValue(getSettings().filenameAsScheduledDateFormat)
                    .onChange(async (value) => {
                        updateSettings({ filenameAsScheduledDateFormat: value });
                        await this.plugin.saveSettings();
                    });
            });

        scheduledDateFolders = new Setting(containerEl)
            .setName(i18n.t('settings.datesFromFileNames.scheduledDate.folders.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.datesFromFileNames.scheduledDate.folders.description'), {
                    requiresReload: true,
                }),
            )
            .addText((input) => {
                input
                    .setPlaceholder(i18n.t('settings.datesFromFileNames.scheduledDate.folders.placeholder'))
                    .setValue(SettingsTab.renderFolderArray(getSettings().filenameAsDateFolders))
                    .onChange(async (value) => {
                        const folders = SettingsTab.parseCommaSeparatedFolders(value);
                        updateSettings({ filenameAsDateFolders: folders });
                        await this.plugin.saveSettings();
                    });
            });
        setSettingVisibility(scheduledDateExtraFormat, getSettings().useFilenameAsScheduledDate);
        setSettingVisibility(scheduledDateFolders, getSettings().useFilenameAsScheduledDate);
    }

    private displayRecurringTasks(containerEl: HTMLElement) {
        new Setting(containerEl).setName(i18n.t('settings.recurringTasks.heading')).setHeading();

        new Setting(containerEl)
            .setName(i18n.t('settings.recurringTasks.nextLine.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.recurringTasks.nextLine.description'), {
                    docsUrl: docs.recurringTasks,
                }),
            )
            .addToggle((toggle) => {
                toggle.setValue(getSettings().recurrenceOnNextLine).onChange(async (value) => {
                    updateSettings({ recurrenceOnNextLine: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.recurringTasks.removeScheduledDate.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.recurringTasks.removeScheduledDate.description'), {
                    docsUrl: docs.recurringTasks,
                }),
            )
            .addToggle((toggle) => {
                toggle.setValue(getSettings().removeScheduledDateOnRecurrence).onChange(async (value) => {
                    updateSettings({ removeScheduledDateOnRecurrence: value });
                    await this.plugin.saveSettings();
                });
            });
    }

    private displayEditing(containerEl: HTMLElement) {
        new Setting(containerEl).setName(i18n.t('settings.editing.heading')).setHeading();
        let autoSuggestMinimumMatchLength: Setting | null = null;
        let autoSuggestMaximumSuggestions: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.toggle.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.autoSuggest.toggle.description'), {
                    docsUrl: docs.autoSuggest,
                    requiresReload: true,
                }),
            )
            .addToggle((toggle) => {
                toggle.setValue(getSettings().autoSuggestInEditor).onChange(async (value) => {
                    updateSettings({ autoSuggestInEditor: value });
                    await this.plugin.saveSettings();
                    setSettingVisibility(autoSuggestMinimumMatchLength, value);
                    setSettingVisibility(autoSuggestMaximumSuggestions, value);
                });
            });

        autoSuggestMinimumMatchLength = new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.minLength.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.autoSuggest.minLength.description'), {
                    requiresReload: true,
                }),
            )
            .addSlider((slider) => {
                slider
                    .setLimits(0, 3, 1)
                    .setValue(getSettings().autoSuggestMinMatch)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMinMatch: value });
                        await this.plugin.saveSettings();
                    });
            });

        autoSuggestMaximumSuggestions = new Setting(containerEl)
            .setName(i18n.t('settings.autoSuggest.maxSuggestions.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.autoSuggest.maxSuggestions.description'), {
                    requiresReload: true,
                }),
            )
            .addSlider((slider) => {
                slider
                    .setLimits(3, 20, 1)
                    .setValue(getSettings().autoSuggestMaxItems)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMaxItems: value });
                        await this.plugin.saveSettings();
                    });
            });
        setSettingVisibility(autoSuggestMinimumMatchLength, getSettings().autoSuggestInEditor);
        setSettingVisibility(autoSuggestMaximumSuggestions, getSettings().autoSuggestInEditor);
    }

    private displayDisplay(containerEl: HTMLElement) {
        new Setting(containerEl).setName(i18n.t('settings.display.heading')).setHeading();
        let editorIconsSetting: Setting | null = null;

        new Setting(containerEl)
            .setName(i18n.t('settings.display.signifiers.name'))
            .setDesc(i18n.t('settings.display.signifiers.description'))
            .addDropdown((dropdown) => {
                dropdown
                    .addOption('icons', i18n.t('settings.display.signifiers.options.icons'))
                    .addOption('emoji', i18n.t('settings.display.signifiers.options.emoji'))
                    .setValue(getSettings().signifierDisplay)
                    .onChange(async (value) => {
                        await this.setSignifierDisplay(value as 'icons' | 'emoji');
                        setSettingVisibility(editorIconsSetting, SettingsTab.editorPropertiesSettingApplies());
                    });
            });

        editorIconsSetting = new Setting(containerEl)
            .setName(i18n.t('settings.display.editorIcons.name'))
            .setDesc(i18n.t('settings.display.editorIcons.description'))
            .addToggle((toggle) => {
                toggle
                    .setValue(getSettings().showIconsInEditor)
                    .onChange(async (value) => await this.setShowIconsInEditor(value));
            });
        setSettingVisibility(editorIconsSetting, SettingsTab.editorPropertiesSettingApplies());

        new Setting(containerEl)
            .setName(i18n.t('settings.display.subtaskProgress.name'))
            .setDesc(i18n.t('settings.display.subtaskProgress.description'))
            .addToggle((toggle) => {
                toggle
                    .setValue(getSettings().showSubtaskProgress)
                    .onChange(async (value) => await this.setShowSubtaskProgress(value));
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.display.taskCountLocation.name'))
            .setDesc(i18n.t('settings.display.taskCountLocation.description'))
            .addDropdown((dropdown) => {
                dropdown
                    .addOption('top', i18n.t('settings.display.taskCountLocation.options.top'))
                    .addOption('bottom', i18n.t('settings.display.taskCountLocation.options.bottom'))
                    .setValue(getSettings().searchResults.taskCountLocation)
                    .onChange(async (value) => await this.setTaskCountLocation(value as 'top' | 'bottom'));
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.display.accessKeys.name'))
            .setDesc(
                SettingsTab.legacyDescription(i18n.t('settings.display.accessKeys.description'), {
                    docsUrl: docs.accessKeys,
                }),
            )
            .addToggle((toggle) => {
                toggle.setValue(getSettings().provideAccessKeys).onChange(async (value) => {
                    updateSettings({ provideAccessKeys: value });
                    await this.plugin.saveSettings();
                });
            });
    }

    /**
     * Add a collapsible section, whose open state is remembered in {@link Settings.headingOpened}.
     */
    private addCollapsibleSection(
        containerEl: HTMLElement,
        heading: string,
        description: string | null,
        renderContent: (sectionEl: HTMLElement) => void,
    ) {
        const { headingOpened } = getSettings();
        const detailsContainer = containerEl.createEl('details', {
            cls: 'tasks-nested-settings',
            attr: (headingOpened[heading] ?? true) ? { open: true } : {},
        });
        detailsContainer.ontoggle = () => {
            headingOpened[heading] = detailsContainer.open;
            updateSettings({ headingOpened: headingOpened });
            void this.plugin.saveSettings();
        };
        const summary = detailsContainer.createEl('summary');
        new Setting(summary).setHeading().setName(heading);
        summary.createDiv('collapser').createDiv('handle');

        if (description !== null) {
            new Setting(detailsContainer).setDesc(description);
        }

        renderContent(detailsContainer);
    }

    /**
     * A row to view and edit one status.
     */
    private createRowForTaskStatus(containerEl: HTMLElement, status: StatusConfiguration, isCoreStatus: boolean) {
        const setting = new Setting(containerEl).setName(status.name || i18n.t('settings.statuses.unnamed'));
        SettingsTab.decorateStatusRow(setting, status);

        setting.addExtraButton((extra) => {
            extra
                .setIcon('pencil')
                .setTooltip(i18n.t('common.edit'))
                .onClick(() => this.openEditStatusModal(status, isCoreStatus));
        });

        if (!isCoreStatus) {
            setting.addExtraButton((extra) => {
                extra
                    .setIcon('trash-2')
                    .setTooltip(i18n.t('common.delete'))
                    .onClick(() => {
                        const { statusSettings } = getSettings();
                        if (StatusSettings.deleteStatus(statusSettings.customStatuses, status)) {
                            updateAndSaveStatusSettings(statusSettings, this);
                        }
                    });
            });
        }
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
        return folders.join(', ');
    }
}

/**
 * Returns the named theme collections used to seed common status sets.
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
