import type { App, Plugin } from 'obsidian';
import type { Task } from './Task/Task';
import type { State } from './Obsidian/CacheState';

/**
 * Interface representing the Tasks plugin's public API surface used by
 * downstream modules (Commands, Api, SettingsTab, QueryRenderer, etc.).
 *
 * Extracted from main.ts to break circular dependencies where downstream
 * modules need the TasksPlugin type but main.ts imports those modules.
 */
export interface ITasksPlugin extends Plugin {
    app: App;
    getTasks(): Task[];
    getState(): State;
    saveSettings(): Promise<void>;
}
