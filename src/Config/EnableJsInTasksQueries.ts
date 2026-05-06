import type { LocalStorageProvider } from './LocalStorageProvider';

export const ENABLE_JS_IN_TASKS_QUERIES_KEY = 'enableJsInTasksQueries';
export const DEFAULT_ENABLE_JS_IN_TASKS_QUERIES = false;

/**
 * In-memory representation of whether JavaScript is enabled in Tasks queries.
 *
 * The value is loaded from Obsidian's vault-local app storage when this object is created,
 * then kept in memory for fast reads.
 *
 * Updates are written back to vault-local app storage, but are intentionally not persisted
 * to the plugin's data.json settings file.
 */
export class EnableJsInTasksQueries {
    private value: boolean;

    constructor(private readonly storage: LocalStorageProvider) {
        this.value = this.loadValue();
    }

    public get(): boolean {
        return this.value;
    }

    public set(value: boolean): void {
        this.value = value;
        this.storage.save(ENABLE_JS_IN_TASKS_QUERIES_KEY, value);
    }

    private loadValue(): boolean {
        const storedValue = this.storage.load(ENABLE_JS_IN_TASKS_QUERIES_KEY);

        if (typeof storedValue === 'boolean') {
            return storedValue;
        }

        return DEFAULT_ENABLE_JS_IN_TASKS_QUERIES;
    }
}
