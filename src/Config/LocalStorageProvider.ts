/**
 * Abstraction over Obsidian's vault-local app storage.
 *
 * This storage is separate from the plugin's data.json settings file.
 */
export interface LocalStorageProvider {
    load(key: string): unknown | null;

    save(key: string, value: unknown | null): void;
}
