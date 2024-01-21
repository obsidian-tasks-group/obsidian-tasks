import type { EventRef, Events as ObsidianEvents } from 'obsidian';

import type { Task } from '../Task/Task';
import { logging } from '../lib/logging';
import type { State } from './Cache';

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
    logger = logging.getLogger('tasks.Events');

    constructor({ obsidianEvents }: { obsidianEvents: ObsidianEvents }) {
        this.obsidianEvents = obsidianEvents;
    }

    public onCacheUpdate(handler: (cacheData: CacheUpdateData) => void): EventRef {
        this.logger.debug('TasksEvents.onCacheUpdate()');
        return this.obsidianEvents.on(Event.CacheUpdate, handler);
    }

    public triggerCacheUpdate(cacheData: CacheUpdateData): void {
        this.logger.debug('TasksEvents.triggerCacheUpdate()');
        this.obsidianEvents.trigger(Event.CacheUpdate, cacheData);
    }

    public onRequestCacheUpdate(handler: (fn: (cacheData: CacheUpdateData) => void) => void): EventRef {
        this.logger.debug('TasksEvents.onRequestCacheUpdate()');
        return this.obsidianEvents.on(Event.RequestCacheUpdate, handler);
    }

    public triggerRequestCacheUpdate(fn: (cacheData: CacheUpdateData) => void): void {
        this.logger.debug('TasksEvents.triggerRequestCacheUpdate()');
        this.obsidianEvents.trigger(Event.RequestCacheUpdate, fn);
    }

    public off(eventRef: EventRef): void {
        this.logger.debug('TasksEvents.off()');
        this.obsidianEvents.offref(eventRef);
    }
}
