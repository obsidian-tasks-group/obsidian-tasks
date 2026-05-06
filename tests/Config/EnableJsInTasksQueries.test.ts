import {
    DEFAULT_ENABLE_JS_IN_TASKS_QUERIES,
    ENABLE_JS_IN_TASKS_QUERIES_KEY,
    EnableJsInTasksQueries,
} from '../../src/Config/EnableJsInTasksQueries';
import { InMemoryLocalStorageProvider } from '../../src/Config/InMemoryLocalStorageProvider';

describe('EnableJsInTasksQueries', () => {
    it('should default to false', () => {
        const storage = new InMemoryLocalStorageProvider();
        const setting = new EnableJsInTasksQueries(storage);

        expect(setting.get()).toBe(DEFAULT_ENABLE_JS_IN_TASKS_QUERIES);
        expect(setting.get()).toBe(false);
    });

    it('should load the initial value from local storage', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save(ENABLE_JS_IN_TASKS_QUERIES_KEY, true);

        const setting = new EnableJsInTasksQueries(storage);

        expect(setting.get()).toBe(true);
    });

    it('can be enabled', () => {
        const storage = new InMemoryLocalStorageProvider();
        const setting = new EnableJsInTasksQueries(storage);

        setting.set(true);

        expect(setting.get()).toBe(true);
        expect(storage.load(ENABLE_JS_IN_TASKS_QUERIES_KEY)).toBe(true);
    });

    it('can be disabled after being enabled', () => {
        const storage = new InMemoryLocalStorageProvider();
        const setting = new EnableJsInTasksQueries(storage);

        setting.set(true);
        setting.set(false);

        expect(setting.get()).toBe(false);
        expect(storage.load(ENABLE_JS_IN_TASKS_QUERIES_KEY)).toBe(false);
    });

    it('should default to false if local storage contains a non-boolean value', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save(ENABLE_JS_IN_TASKS_QUERIES_KEY, 'true');

        const setting = new EnableJsInTasksQueries(storage);

        expect(setting.get()).toBe(false);
    });

    it('should keep the value in memory after construction', () => {
        const storage = new InMemoryLocalStorageProvider();

        storage.save(ENABLE_JS_IN_TASKS_QUERIES_KEY, true);

        const setting = new EnableJsInTasksQueries(storage);

        storage.save(ENABLE_JS_IN_TASKS_QUERIES_KEY, false);

        expect(setting.get()).toBe(true);
    });
});
