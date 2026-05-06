import type { LocalStorageProvider } from './LocalStorageProvider';

/**
 * Test implementation of {@link LocalStorageProvider}.
 */
export class InMemoryLocalStorageProvider implements LocalStorageProvider {
    private readonly values = new Map<string, unknown>();

    public load(key: string): unknown | null {
        if (!this.values.has(key)) {
            return null;
        }

        return this.values.get(key) ?? null;
    }

    public save(key: string, value: unknown | null): void {
        if (value === null) {
            this.values.delete(key);
            return;
        }

        this.values.set(key, value);
    }
}
