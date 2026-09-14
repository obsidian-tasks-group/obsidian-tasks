import { Plugin, type Reference, getLinkpath } from 'obsidian';

import type { Task } from 'Task/Task';
import { i18n, initializeI18n } from './i18n/i18n';
import { Cache, State } from './Obsidian/Cache';
import { Commands } from './Commands';
import { GlobalQuery } from './Config/GlobalQuery';
import { TasksEvents } from './Obsidian/TasksEvents';
import { initializeFile } from './Obsidian/File';
import { InlineRenderer } from './Obsidian/InlineRenderer';
import { newLivePreviewExtension } from './Obsidian/LivePreviewExtension';
import { QueryRenderer } from './Renderer/QueryRenderer';
import { getSettings, updateSettings } from './Config/Settings';
import { SettingsTab } from './Config/SettingsTab';
import { StatusRegistry } from './Statuses/StatusRegistry';
import { log, logging } from './lib/logging';
import { EditorSuggestor } from './Suggestor/EditorSuggestorPopup';
import { StatusSettings } from './Config/StatusSettings';
import { tasksApiV1 } from './Api';
import { GlobalFilter } from './Config/GlobalFilter';
import { QueryFileDefaults } from './Query/QueryFileDefaults';
import { LinkResolver } from './Task/LinkResolver';
import { ObsidianLocalStorageProvider } from './Config/ObsidianLocalStorageProvider';
import { EnableJsInTasksQueries } from './Config/EnableJsInTasksQueries';
import { ReminderCheckLoop } from './Notifications/NotificationScheduler';
import { notifyMissedReminders, notifyRemindersDue } from './Notifications/ReminderNotifier';
import { groupTasksByBucket } from './Notifications/NotificationBuckets';
import { NOTIFICATIONS_VIEW_TYPE, NotificationsItemView } from './Obsidian/NotificationsItemView';

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;
    public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;

    get apiV1() {
        return tasksApiV1(this);
    }

    async onload() {
        await initializeI18n();

        logging.registerConsoleLogger();
        log('info', i18n.t('main.loadingPlugin', { name: this.manifest.name, version: this.manifest.version }));

        await this.loadSettings();

        EnableJsInTasksQueries.initialise(new ObsidianLocalStorageProvider(this.app));

        // Configure logging.
        const { loggingOptions } = getSettings();
        logging.configure(loggingOptions);

        // Configure LinkResolver.getInstance().resolve(), to ensure that links know where Obsidian will resolve them to:
        LinkResolver.getInstance().setGetFirstLinkpathDestFn((link: Reference, sourcePath: string) => {
            const linkpath = getLinkpath(link.link);
            const tFile = this.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
            return tFile ? tFile.path : null;
        });

        const events = new TasksEvents({ obsidianEvents: this.app.workspace });

        this.addSettingTab(new SettingsTab({ plugin: this, events }));

        initializeFile({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
            workspace: this.app.workspace,
        });

        // Load configured status types.
        await this.loadTaskStatuses();

        this.cache = new Cache({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
            workspace: this.app.workspace,
            events,
        });

        this.inlineRenderer = new InlineRenderer({ plugin: this, app: this.app });
        this.queryRenderer = new QueryRenderer({ plugin: this, events });

        this.registerView(NOTIFICATIONS_VIEW_TYPE, (leaf) => new NotificationsItemView(leaf, this, events));
        this.addRibbonIcon('bell', 'Open reminder notifications', () => void this.openNotificationsView());

        // Update types.json.
        this.setObsidianPropertiesTypes();

        this.registerEditorExtension(newLivePreviewExtension(this));
        this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings(), this));
        new Commands({ plugin: this });

        // Both use the same instant as the boundary between "missed before this session" and "due from now
        // on" - see checkForMissedRemindersOnStartup's own doc comment for why that must line up exactly.
        const startupMoment = window.moment();
        this.registerReminderNotifications(startupMoment);
        this.checkForMissedRemindersOnStartup(events, startupMoment);
    }

    /**
     * Reveals the notifications view (see `Obsidian/NotificationsItemView.ts`), reusing an existing tab if
     * one is already open rather than creating a duplicate. Called from the ribbon icon, the "Open
     * reminder notifications" command (`Commands/index.ts`), and a due notification's click handler below
     * - all funnel through this one method so they can never end up creating separate tabs.
     */
    public async openNotificationsView(): Promise<void> {
        const existing = this.app.workspace.getLeavesOfType(NOTIFICATIONS_VIEW_TYPE);
        const leaf = existing[0] ?? this.app.workspace.getLeaf(true);
        if (existing.length === 0) {
            await leaf.setViewState({ type: NOTIFICATIONS_VIEW_TYPE, active: true });
        }
        await this.app.workspace.revealLeaf(leaf);
    }

    /**
     * Registers a single periodic check for due reminders (see `Notifications/NotificationScheduler.ts`),
     * for the lifetime of the plugin. Registered unconditionally (via `registerInterval`, so Obsidian
     * auto-clears it on unload/disable) rather than only when `notificationsEnabled` is currently true, so
     * that turning the setting on later takes effect immediately, with no reload needed - only the check
     * *interval* itself (`notificationCheckIntervalSeconds`) is fixed for the plugin's lifetime and needs a
     * reload to change, per the "Reload" button shown next to that setting.
     *
     * @param startupMoment - the `ReminderCheckLoop`'s initial window start. Passed in (rather than
     *   defaulted to `window.moment()` here) so it's the exact same instant `checkForMissedRemindersOnStartup`
     *   uses as its cutoff - together they partition time with no gap and no overlap.
     */
    private registerReminderNotifications(startupMoment: Moment) {
        const checkLoop = new ReminderCheckLoop(startupMoment);
        this.registerInterval(
            window.setInterval(() => {
                if (!getSettings().notificationsEnabled) {
                    return;
                }
                const due = checkLoop.tick(this.getTasks(), window.moment());
                if (due.length > 0) {
                    // One combined notification per check, even if several reminders came due in the same
                    // window - never one notification per task.
                    notifyRemindersDue(due, () => {
                        window.focus(); // bring the Obsidian window itself to the foreground - revealLeaf
                        void this.openNotificationsView(); // alone only changes the active tab inside the app
                    });
                }
            }, getSettings().notificationCheckIntervalSeconds * 1000),
        );
    }

    /**
     * Fires a one-time startup summary ("N reminders came due while you were away") for any reminder that
     * was already overdue *before* this session began - i.e. `reminderDateTime.isSameOrBefore(startupMoment)`.
     * `ReminderCheckLoop`'s own window (see `registerReminderNotifications` above) starts at that same
     * instant, so anything already overdue at that point can never fall inside a later window and would
     * otherwise be silently skipped forever, not just delayed - this is what covers that gap, without
     * turning it into a notification burst (one combined notification here too, via
     * {@link notifyMissedReminders}, same as a normal check).
     *
     * Runs exactly once. The cache may already be warm by the time this runs (e.g. reloading the plugin
     * while Obsidian is already open) or may still be loading (a fresh launch) - `triggerRequestCacheUpdate`
     * asks for its *current* state synchronously; if that's not yet `Warm`, this falls back to waiting for
     * the first `onCacheUpdate` that reports `Warm`, then unsubscribes.
     */
    private checkForMissedRemindersOnStartup(events: TasksEvents, startupMoment: Moment) {
        if (!getSettings().notificationsEnabled) {
            return;
        }

        const reportIfAny = (tasks: Task[]) => {
            const missed = groupTasksByBucket(tasks, startupMoment).overdue;
            if (missed.length > 0) {
                notifyMissedReminders(missed, () => {
                    window.focus();
                    void this.openNotificationsView();
                });
            }
        };

        events.triggerRequestCacheUpdate(({ tasks, state }) => {
            if (state === State.Warm) {
                reportIfAny(tasks);
                return;
            }
            const ref = events.onCacheUpdate((cacheData) => {
                if (cacheData.state !== State.Warm) {
                    return;
                }
                events.off(ref);
                reportIfAny(cacheData.tasks);
            });
            this.registerEvent(ref);
        });
    }

    async loadTaskStatuses() {
        const { statusSettings } = getSettings();
        StatusSettings.applyToStatusRegistry(statusSettings, StatusRegistry.getInstance());
    }

    onunload() {
        log('info', i18n.t('main.unloadingPlugin', { name: this.manifest.name, version: this.manifest.version }));
        this.cache?.unload();
    }

    async loadSettings() {
        let newSettings = await this.loadData();
        updateSettings(newSettings);

        // Fetch the updated settings, in case the user has not yet edited the settings,
        // in which case newSettings is currently empty.
        newSettings = getSettings();
        GlobalFilter.getInstance().set(newSettings.globalFilter);
        GlobalFilter.getInstance().setRemoveGlobalFilter(newSettings.removeGlobalFilter);
        GlobalQuery.getInstance().set(newSettings.globalQuery);

        await this.loadTaskStatuses();
    }

    async saveSettings() {
        await this.saveData(getSettings());
    }

    public getTasks(): Task[] {
        if (this.cache === undefined) {
            return [] as Task[];
        } else {
            return this.cache.getTasks();
        }
    }

    public getState(): State {
        if (this.cache === undefined) {
            return State.Cold;
        }
        return this.cache.getState();
    }

    /**
     * Add {@link QueryFileDefaults} properties to the Obsidian vault's types.json file,
     * so that they are available via auto-complete in the File Properties panel.
     */
    private setObsidianPropertiesTypes() {
        // Credit: this code based on ideas...
        // by:
        //      @SkepticMystic
        // in:
        //      https://github.com/SkepticMystic/breadcrumbs/blob/d380407678ce64f5668550d270b1035bc1a767f8/src/main.ts#L47-L64
        try {
            // @ts-expect-error TS2339: Property metadataTypeManager does not exist on type App
            const metadataTypeManager = this.app.metadataTypeManager;
            const all_properties = metadataTypeManager.getAllProperties();

            const defaults = new QueryFileDefaults();
            for (const field of defaults.allPropertyNamesSorted()) {
                const property_type = defaults.propertyType(field);
                if (all_properties[field]?.type === property_type) {
                    continue;
                }
                metadataTypeManager.setType(field, property_type);
            }
        } catch (error) {
            console.error('setObsidianPropertiesTypes error', error);
        }
    }
}
