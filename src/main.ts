import { Plugin } from 'obsidian';

import type { Task } from 'Task/Task';
import { TickTickApi } from 'TickTick/api';
import { i18n, initializeI18n } from './i18n/i18n';
import { Cache, State, type TasksMap } from './Obsidian/Cache';
import { Commands } from './Commands';
import { GlobalQuery } from './Config/GlobalQuery';
import { TasksEvents } from './Obsidian/TasksEvents';
import { initializeFile, replaceTaskWithTasks } from './Obsidian/File';
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

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;
    public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;
    private _ticktickapi: TickTickApi | undefined;

    get apiV1() {
        return tasksApiV1(this.app);
    }

    get ticktickapi() {
        if (!this._ticktickapi) {
            this._ticktickapi = TickTickApi.getInstance();
        }
        return this._ticktickapi;
    }

    async onload() {
        await initializeI18n();

        logging.registerConsoleLogger();
        log('info', i18n.t('main.loadingPlugin', { name: this.manifest.name, version: this.manifest.version }));

        await this.loadSettings();

        const { username, password } = getSettings();
        if (username && password) {
            this.ticktickapi.setUsername(username);
            this.ticktickapi.setPassword(password);
            this.ticktickapi.login();
        }

        // Configure logging.
        const { loggingOptions } = getSettings();
        logging.configure(loggingOptions);

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

        this.inlineRenderer = new InlineRenderer({ plugin: this });
        this.queryRenderer = new QueryRenderer({ plugin: this, events });

        // Update types.json.
        this.setObsidianPropertiesTypes();

        this.registerEditorExtension(newLivePreviewExtension());
        this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings(), this));
        this.registerInterval(window.setInterval(() => this.ticktickapi.login(), 1000 * 60 * 60 * 12)); // 12 hours
        new Commands({ plugin: this });
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

    public getTasksMap(): TasksMap {
        if (this.cache === undefined) {
            return {} as TasksMap;
        } else {
            return this.cache.getTasksMap();
        }
    }

    public async ticktickSync(skipTask?: Task) {
        const { checkpoint } = getSettings();
        const syncCheckpoint = await this.ticktickapi.sync(checkpoint);
        const tasksMap = this.getTasksMap();

        const createOrUpdates = [...syncCheckpoint.taskSync.add, ...syncCheckpoint.taskSync.update];
        for (const update of createOrUpdates) {
            if (update.tickTickId === skipTask?.tickTickId) {
                continue;
            }
            const oldTask = tasksMap.get(update.tickTickId);
            if (!oldTask) {
                const file = this.app.workspace.getActiveFile();
                if (!file) {
                    continue;
                }
                const newTask = update.toFileLineString();
                await this.app.vault.append(file, newTask + '\n');
                console.log('created new task', newTask);
                continue;
            }
            update.taskLocation = oldTask.taskLocation;
            await replaceTaskWithTasks({ originalTask: oldTask, newTasks: update });
            console.log('updated task', update.toFileLineString());
        }
        updateSettings({ checkpoint: syncCheckpoint.checkpoint });
        console.log('updated checkpoint', syncCheckpoint.checkpoint);
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
