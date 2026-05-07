/**
 * Abstraction over Obsidian's vault-local app storage.
 *
 * This storage is separate from the plugin's data.json settings file.
 */
export interface LocalStorageProvider {
    /**
     * Load a value from the local storage. null means the key is not present.
     */
    load(key: string): unknown;

    /**
     * Save a value to the local storage. null means remove the key if it was already present.
     */
    save(key: string, value: unknown): void;
}
