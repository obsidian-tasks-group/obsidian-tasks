import moment from 'moment/moment';
import type { Mock } from 'vitest';
import type { CachedMetadata, EventRef, MetadataCache, TFile, Vault, Workspace } from 'obsidian';
import { Cache, State } from '../../src/Obsidian/Cache';
import type { TasksEvents } from '../../src/Obsidian/TasksEvents';
import type { Logger } from '../../src/lib/logging';
import { createTFile } from '../__mocks__/obsidian';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

window.moment = moment;

const eventReference = {} as EventRef;
const taskData = MockDataLoader.get('one_task');

/**
 * Creates a test environment for exercising Cache loading behaviour.
 *
 * The returned helpers allow tests to manually run the callbacks registered with
 * the mocked Obsidian workspace and Tasks events, so cache loading and vault
 * reload behaviour can be tested deterministically.
 *
 * @param files - Markdown files returned by the mocked vault.
 * @param cachedRead - Mock implementation used when the cache reads file contents.
 * @param getFileCache - Optional mock implementation for Obsidian metadata lookup.
 * @returns The Cache under test and helpers for triggering registered lifecycle callbacks.
 */
function createCacheEnvironment({
    files,
    cachedRead,
    getFileCache = () => taskData.cachedMetadata,
}: {
    files: TFile[];
    cachedRead: Mock<(file: TFile) => Promise<string>>;
    getFileCache?: (file: TFile) => CachedMetadata | null;
}) {
    let layoutReadyCallback: (() => Promise<void>) | undefined;
    let reloadVaultCallback: (() => Promise<void>) | undefined;
    let changedCallback: ((file: TFile) => Promise<void>) | undefined;
    const metadataCache = {
        getFileCache: vi.fn(getFileCache),
        offref: vi.fn(),
        on: vi.fn((event: string, callback: (file: TFile) => Promise<void>) => {
            if (event === 'changed') {
                changedCallback = callback;
            }
            return eventReference;
        }),
    } as unknown as MetadataCache;
    const vault = {
        cachedRead,
        getMarkdownFiles: vi.fn(() => files),
        offref: vi.fn(),
        on: vi.fn(() => eventReference),
    } as unknown as Vault;
    const workspace = {
        onLayoutReady: vi.fn((callback: () => Promise<void>) => {
            layoutReadyCallback = callback;
        }),
    } as unknown as Workspace;
    const events = {
        off: vi.fn(),
        onReloadVault: vi.fn((callback: () => Promise<void>) => {
            reloadVaultCallback = callback;
            return eventReference;
        }),
        onRequestCacheUpdate: vi.fn(() => eventReference),
        triggerCacheUpdate: vi.fn(),
    } as unknown as TasksEvents;

    const cache = new Cache({ metadataCache, vault, workspace, events });
    const logger = {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    };
    cache.logger = logger as unknown as Logger;

    return {
        cache,
        logger,
        runLayoutReady: async () => {
            expect(layoutReadyCallback).toBeDefined();
            await layoutReadyCallback?.();
        },
        runReloadVault: async () => {
            expect(reloadVaultCallback).toBeDefined();
            await reloadVaultCallback?.();
        },
        runFileChanged: async (file: TFile) => {
            expect(changedCallback).toBeDefined();
            await changedCallback?.(file);
        },
    };
}

describe('Cache loading', () => {
    it('should limit how many files are indexed concurrently', async () => {
        const files = Array.from({ length: 12 }, (_value, index) => createTFile(`${index}.md`));
        let activeReads = 0;
        let maximumActiveReads = 0;
        const cachedRead = vi.fn<(file: TFile) => Promise<string>>(async () => {
            activeReads++;
            maximumActiveReads = Math.max(maximumActiveReads, activeReads);
            // Keep the fake read pending for one event-loop turn so the worker reads overlap.
            await new Promise((resolve) => window.setTimeout(resolve, 0));
            activeReads--;
            return taskData.fileContents;
        });
        const { cache, runLayoutReady } = createCacheEnvironment({ files, cachedRead });

        await runLayoutReady();

        expect(maximumActiveReads).toBe(4);
        expect(cache.getState()).toBe(State.Warm);
    });

    it('should notify subscribers once after the bulk load completes', async () => {
        const files = [createTFile('one.md'), createTFile('two.md'), createTFile('three.md')];
        const cachedRead = vi.fn<(file: TFile) => Promise<string>>(async () => taskData.fileContents);
        const { cache, logger, runLayoutReady } = createCacheEnvironment({ files, cachedRead });
        const statesWhenSubscribersWereNotified: State[] = [];
        logger.debug.mockImplementation((message) => {
            if (message === 'Cache.notifySubscribers()') {
                statesWhenSubscribersWereNotified.push(cache.getState());
            }
        });

        await runLayoutReady();

        expect(statesWhenSubscribersWereNotified).toEqual([State.Warm]);
        expect(cache.getState()).toBe(State.Warm);
    });

    it('should continue notifying subscribers when an individual file changes', async () => {
        const file = createTFile('changed.md');
        const changedFileContents = taskData.fileContents.replace('the only task', 'the next task');
        const cachedRead = vi
            .fn<(file: TFile) => Promise<string>>()
            .mockResolvedValueOnce(taskData.fileContents)
            .mockResolvedValue(changedFileContents);
        const { logger, runFileChanged, runLayoutReady } = createCacheEnvironment({ files: [file], cachedRead });

        await runLayoutReady();
        logger.debug.mockClear();
        await runFileChanged(file);

        const notificationCalls = logger.debug.mock.calls.filter(
            ([message]) => message === 'Cache.notifySubscribers()',
        );
        expect(notificationCalls).toHaveLength(1);
    });

    it('should not read a file whose metadata contains only plain list items', async () => {
        const file = createTFile('plain-list.md');
        const cachedRead = vi.fn<(file: TFile) => Promise<string>>(async () => '- a plain list item');
        // Keep the Markdown fixture unchanged, but make its cached metadata describe plain list items instead of
        // checkbox items. cachedRead() must not be called, so the intentional mismatch cannot affect the result.
        const plainListMetadata: CachedMetadata = {
            listItems: taskData.cachedMetadata.listItems?.map((item) => ({ ...item, task: undefined })),
        };
        const { runLayoutReady } = createCacheEnvironment({
            files: [file],
            cachedRead,
            getFileCache: () => plainListMetadata,
        });

        await runLayoutReady();

        expect(cachedRead).not.toHaveBeenCalled();
    });

    it('should keep loading when one file read fails', async () => {
        const unavailableFile = createTFile('unavailable.md');
        const readableFile = createTFile('readable.md');
        const readError = new Error('ETIMEDOUT: connection timed out, read');
        const cachedRead = vi.fn<(file: TFile) => Promise<string>>(async (file) => {
            if (file === unavailableFile) {
                throw readError;
            }
            return taskData.fileContents;
        });
        const { cache, runLayoutReady } = createCacheEnvironment({
            files: [unavailableFile, readableFile],
            cachedRead,
        });

        await expect(runLayoutReady()).resolves.toBeUndefined();

        expect(cache.getState()).toBe(State.Warm);
        expect(cache.getTasks()).toHaveLength(1);
        expect(cache.getTasks()[0].path).toBe(readableFile.path);
        expect(cache.logger.error).toHaveBeenCalledWith(expect.stringContaining(unavailableFile.path), readError);
    });

    it('should preserve previously cached tasks when a later read fails', async () => {
        const file = createTFile('temporarily-unavailable.md');
        const readError = new Error('EIO: input/output error, read');
        let shouldReadFail = false;
        const cachedRead = vi.fn<(file: TFile) => Promise<string>>(async () => {
            if (shouldReadFail) {
                throw readError;
            }
            return taskData.fileContents;
        });
        const { cache, runLayoutReady, runReloadVault } = createCacheEnvironment({ files: [file], cachedRead });

        await runLayoutReady();
        const previouslyCachedTasks = cache.getTasks();
        expect(previouslyCachedTasks).toHaveLength(1);

        shouldReadFail = true;
        await expect(runReloadVault()).resolves.toBeUndefined();

        expect(cache.getState()).toBe(State.Warm);
        expect(cache.getTasks()).toEqual(previouslyCachedTasks);
        expect(cache.logger.error).toHaveBeenCalledWith(expect.stringContaining(file.path), readError);
    });
});
