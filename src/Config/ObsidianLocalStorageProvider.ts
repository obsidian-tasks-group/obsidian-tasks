import type { App } from 'obsidian';
import type { LocalStorageProvider } from './LocalStorageProvider';

/**
 * Implementation of {@link LocalStorageProvider} backed by Obsidian's vault-local app storage.
 */
export class ObsidianLocalStorageProvider implements LocalStorageProvider {
    constructor(private readonly app: App) {}

    public load(key: string): unknown {
        return this.app.loadLocalStorage(key);
    }

    public save(key: string, value: unknown): void {
        this.app.saveLocalStorage(key, value);
    }
}
