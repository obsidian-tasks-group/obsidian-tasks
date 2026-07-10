/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import type { CachedMetadata, EventRef, MetadataCache, TFile, Vault, Workspace } from 'obsidian';
import { Cache, State } from '../../src/Obsidian/Cache';
import type { TasksEvents } from '../../src/Obsidian/TasksEvents';
import type { Logger } from '../../src/lib/logging';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

jest.mock('obsidian');
jest.mock('../../src/lib/PerformanceTracker', () => ({
    PerformanceTracker: class {
        public start(): void {}
        public finish(): void {}
    },
}));

window.moment = moment;

const eventReference = {} as EventRef;
const taskData = MockDataLoader.get('one_task');

function createFile(path: string): TFile {
    const name = path.split('/').pop() ?? path;
    const extension = name.includes('.') ? name.split('.').pop() ?? '' : '';
    const basename = extension === '' ? name : name.slice(0, -(extension.length + 1));

    return {
        vault: {} as Vault,
        path,
        name,
        parent: null,
        stat: { ctime: 0, mtime: 0, size: 0 },
        basename,
        extension,
    };
}

function createCacheEnvironment({
    files,
    cachedRead,
    getFileCache = () => taskData.cachedMetadata,
}: {
    files: TFile[];
    cachedRead: jest.Mock<Promise<string>, [TFile]>;
    getFileCache?: (file: TFile) => CachedMetadata | null;
}) {
    let layoutReadyCallback: (() => Promise<void>) | undefined;
    const metadataCache = {
        getFileCache: jest.fn(getFileCache),
        offref: jest.fn(),
        on: jest.fn(() => eventReference),
    } as unknown as MetadataCache;
    const vault = {
        cachedRead,
        getMarkdownFiles: jest.fn(() => files),
        offref: jest.fn(),
        on: jest.fn(() => eventReference),
    } as unknown as Vault;
    const workspace = {
        onLayoutReady: jest.fn((callback: () => Promise<void>) => {
            layoutReadyCallback = callback;
        }),
    } as unknown as Workspace;
    const events = {
        off: jest.fn(),
        onReloadVault: jest.fn(() => eventReference),
        onRequestCacheUpdate: jest.fn(() => eventReference),
        triggerCacheUpdate: jest.fn(),
    } as unknown as TasksEvents;

    const cache = new Cache({ metadataCache, vault, workspace, events });
    cache.logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    } as unknown as Logger;

    return {
        cache,
        runLayoutReady: async () => {
            expect(layoutReadyCallback).toBeDefined();
            await layoutReadyCallback?.();
        },
    };
}

describe('Cache loading', () => {
    it.failing('should limit how many files are indexed concurrently', async () => {
        const files = Array.from({ length: 12 }, (_value, index) => createFile(`${index}.md`));
        let activeReads = 0;
        let maximumActiveReads = 0;
        const cachedRead = jest.fn<Promise<string>, [TFile]>(async () => {
            activeReads++;
            maximumActiveReads = Math.max(maximumActiveReads, activeReads);
            await new Promise((resolve) => setTimeout(resolve, 0));
            activeReads--;
            return taskData.fileContents;
        });
        const { cache, runLayoutReady } = createCacheEnvironment({ files, cachedRead });

        await runLayoutReady();

        expect(maximumActiveReads).toBeLessThanOrEqual(4);
        expect(cache.getState()).toBe(State.Warm);
    });

    it.failing('should not read a file whose metadata contains only plain list items', async () => {
        const file = createFile('plain-list.md');
        const cachedRead = jest.fn<Promise<string>, [TFile]>(async () => '- a plain list item');
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

    it.failing('should keep loading when one file read fails', async () => {
        const unavailableFile = createFile('unavailable.md');
        const readableFile = createFile('readable.md');
        const readError = new Error('ETIMEDOUT: connection timed out, read');
        const cachedRead = jest.fn<Promise<string>, [TFile]>(async (file) => {
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
});
