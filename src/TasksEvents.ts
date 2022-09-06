import type { EventRef, Events as ObsidianEvents } from 'obsidian';

import type { State } from './Cache';
import type { Task } from './Task';

enum Event {
    CacheUpdate = 'obsidian-tasks-plugin:cache-update',
    RequestCacheUpdate = 'obsidian-tasks-plugin:request-cache-update',
}

interface CacheUpdateData {
    tasks: Task[];
    state: State;
}

export class TasksEvents {
    private obsidianEvents: ObsidianEvents;

    constructor({ obsidianEvents }: { obsidianEvents: ObsidianEvents }) {
        this.obsidianEvents = obsidianEvents;
    }

    public onCacheUpdate(handler: (cacheData: CacheUpdateData) => void): EventRef {
        return this.obsidianEvents.on(Event.CacheUpdate, handler);
    }

    public triggerCacheUpdate(cacheData: CacheUpdateData): void {
        this.obsidianEvents.trigger(Event.CacheUpdate, cacheData);
    }

    public onRequestCacheUpdate(handler: (fn: (cacheData: CacheUpdateData) => void) => void): EventRef {
        return this.obsidianEvents.on(Event.RequestCacheUpdate, handler);
    }

    public triggerRequestCacheUpdate(fn: (cacheData: CacheUpdateData) => void): void {
        this.obsidianEvents.trigger(Event.RequestCacheUpdate, fn);
    }

    public off(eventRef: EventRef): void {
        this.obsidianEvents.offref(eventRef);
    }
}
