import type { LocalStorageProvider } from './LocalStorageProvider';

export const ENABLE_JS_IN_TASKS_QUERIES_KEY = 'enableJsInTasksQueries';
export const DEFAULT_ENABLE_JS_IN_TASKS_QUERIES = false;

/**
 * In-memory representation of whether JavaScript is enabled in Tasks queries.
 *
 * There are two ways of using this class.
 * - In production code, call {@link EnableJsInTasksQueries.getInstance()} to obtain
 *   the single global instance initialised by the plugin.
 * - Tests can use `new EnableJsInTasksQueries(storage)`, which makes simpler,
 *   more readable tests that can be run in parallel.
 *
 * The value is loaded from Obsidian's vault-local app storage when this object is created,
 * then kept in memory for fast reads.
 *
 * Updates are written back to vault-local app storage, but are intentionally not persisted
 * to the plugin's data.json settings file.
 */
export class EnableJsInTasksQueries {
    private static instance: EnableJsInTasksQueries | undefined;

    private value: boolean;

    /**
     * Creates an instance of the JavaScript-in-Tasks-queries setting.
     *
     * Code in the plugin should use {@link getInstance} to access the global instance.
     */
    constructor(private readonly storage: LocalStorageProvider) {
        this.value = this.loadValue();
    }

    /**
     * Initialises the single global instance from Obsidian's vault-local app storage.
     *
     * This should be called once during plugin startup.
     */
    public static initialise(storage: LocalStorageProvider): EnableJsInTasksQueries {
        EnableJsInTasksQueries.instance = new EnableJsInTasksQueries(storage);
        return EnableJsInTasksQueries.instance;
    }

    /**
     * Provides access to the single global instance of this setting.
     *
     * This should be used in plugin code after the plugin has initialised local storage.
     */
    public static getInstance(): EnableJsInTasksQueries {
        if (!EnableJsInTasksQueries.instance) {
            throw new Error('EnableJsInTasksQueries has not been initialised.');
        }

        return EnableJsInTasksQueries.instance;
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
