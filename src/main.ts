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
import { globalGetFileCache } from './Obsidian/CacheReader';

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

        // Configure logging.
        const { loggingOptions } = getSettings();
        logging.configure(loggingOptions);

        // Configure LinkResolver.getInstance().resolve(), to ensure that links know where Obsidian will resolve them to:
        LinkResolver.getInstance().setGetFirstLinkpathDestFn((link: Reference, sourcePath: string) => {
            const linkpath = getLinkpath(link.link);
            const tFile = this.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
            return tFile ? tFile.path : null;
        });

        // Configure LinkResolver.getInstance().getFileCache():
        LinkResolver.getInstance().setGetFileCacheFn((filePath: string) => {
            return globalGetFileCache(this.app, filePath);
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

        // Update types.json.
        this.setObsidianPropertiesTypes();

        this.registerEditorExtension(newLivePreviewExtension());
        this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings(), this));
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
