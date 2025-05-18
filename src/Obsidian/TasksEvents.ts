import type { EventRef, Events as ObsidianEvents } from 'obsidian';

import type { Task } from '../Task/Task';
import { logging } from '../lib/logging';
import type { State } from './Cache';

enum Event {
    CacheUpdate = 'obsidian-tasks-plugin:cache-update',
    RequestCacheUpdate = 'obsidian-tasks-plugin:request-cache-update',
    ReloadOpenSearchResults = 'obsidian-tasks-plugin:reload-open-search-results',
}

interface CacheUpdateData {
    tasks: Task[];
    state: State;
}

export class TasksEvents {
    private obsidianEvents: ObsidianEvents;
    logger = logging.getLogger('tasks.Events');

    constructor({ obsidianEvents }: { obsidianEvents: ObsidianEvents }) {
        this.obsidianEvents = obsidianEvents;
    }

    // ------------------------------------------------------------------------
    // CacheUpdate event

    public onCacheUpdate(handler: (cacheData: CacheUpdateData) => void): EventRef {
        this.logger.debug('TasksEvents.onCacheUpdate()');
        const name = Event.CacheUpdate;
        // @ts-expect-error: error TS2345: Argument of type '(cacheData: CacheUpdateData) => void'
        // is not assignable to parameter of type '(...data: unknown[]) => unknown'.
        return this.obsidianEvents.on(name, handler);
    }

    public triggerCacheUpdate(cacheData: CacheUpdateData): void {
        this.logger.debug('TasksEvents.triggerCacheUpdate()');
        this.obsidianEvents.trigger(Event.CacheUpdate, cacheData);
    }

    // ------------------------------------------------------------------------
    // RequestCacheUpdate event

    public onRequestCacheUpdate(handler: (fn: (cacheData: CacheUpdateData) => void) => void): EventRef {
        this.logger.debug('TasksEvents.onRequestCacheUpdate()');
        const name = Event.RequestCacheUpdate;
        // @ts-expect-error: error TS2345: Argument of type '(cacheData: CacheUpdateData) => void'
        // is not assignable to parameter of type '(...data: unknown[]) => unknown'.
        return this.obsidianEvents.on(name, handler);
    }

    public triggerRequestCacheUpdate(fn: (cacheData: CacheUpdateData) => void): void {
        this.logger.debug('TasksEvents.triggerRequestCacheUpdate()');
        this.obsidianEvents.trigger(Event.RequestCacheUpdate, fn);
    }

    // ------------------------------------------------------------------------
    // ReloadOpenSearchResults event

    public onReloadOpenSearchResults(handler: () => void): EventRef {
        this.logger.debug('TasksEvents.onReloadOpenSearchResults()');
        const name = Event.ReloadOpenSearchResults;
        return this.obsidianEvents.on(name, handler);
    }

    public triggerReloadOpenSearchResults(): void {
        this.logger.debug('TasksEvents.triggerReloadOpenSearchResults()');
        this.obsidianEvents.trigger(Event.ReloadOpenSearchResults);
    }

    public off(eventRef: EventRef): void {
        this.logger.debug('TasksEvents.off()');
        this.obsidianEvents.offref(eventRef);
    }
}
