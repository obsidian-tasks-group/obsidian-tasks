import { InMemoryLocalStorageProvider } from '../../src/Config/InMemoryLocalStorageProvider';

describe('InMemoryLocalStorageProvider', () => {
    it('should return null for a missing key', () => {
        const storage = new InMemoryLocalStorageProvider();

        expect(storage.load('missing')).toBeNull();
    });

    it('should load a saved boolean value', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save('enabled', true);

        expect(storage.load('enabled')).toBe(true);
    });

    it('should load a saved string value', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save('name', 'Tasks');

        expect(storage.load('name')).toBe('Tasks');
    });

    it('should load a saved object value', () => {
        const storage = new InMemoryLocalStorageProvider();
        const value = { enabled: true, count: 3 };

        storage.save('settings', value);

        expect(storage.load('settings')).toEqual(value);
    });

    it('should replace an existing value', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save('enabled', true);
        storage.save('enabled', false);

        expect(storage.load('enabled')).toBe(false);
    });

    it('should clear a saved value when null is saved', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save('enabled', true);
        storage.save('enabled', null);

        expect(storage.load('enabled')).toBeNull();
    });
});
