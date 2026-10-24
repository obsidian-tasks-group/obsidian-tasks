import type { App, CachedMetadata, TFile } from 'obsidian';
import { createTFile } from '../__mocks__/obsidian';
import type TasksPlugin from '../../src/main';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { createTaskLineModal } from '../../src/Api/createTaskLineModal';
import { editTaskLineModal } from '../../src/Api/editTaskLineModal';
import { tasksApiV1 } from '../../src/Api/index';

import { MockDataLoader } from '../TestingTools/MockDataLoader';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';

const registeredMockPaths: string[] = [];

function registerMockMetadata(cachedMetadata: CachedMetadata, filePath = 'mock.md') {
    const simulatedFile: SimulatedFile = {
        cachedMetadata,
        filePath,
        fileContents: '',
        getAllTags: [],
        parseFrontMatterTags: null,
        resolveLinkToPath: {},
    };
    (MockDataLoader as any).cache.set(filePath, simulatedFile);
    registeredMockPaths.push(filePath);
}

function createMockApp(overrides: { vault?: any; metadataCache?: any } = {}): App {
    return {
        vault: {
            getFileByPath: vi.fn(() => null),
            ...overrides.vault,
        },
        metadataCache: {
            getFileCache: vi.fn(() => null),
            ...overrides.metadataCache,
        },
    } as unknown as App;
}

vi.mock('../../src/Api/createTaskLineModal', () => ({
    createTaskLineModal: vi.fn(),
}));

vi.mock('../../src/Api/editTaskLineModal', () => ({
    editTaskLineModal: vi.fn(),
}));

describe('definition of public Api', () => {
    afterEach(() => {
        GlobalQuery.getInstance().reset();
        registeredMockPaths.forEach((path) => (MockDataLoader as any).cache.delete(path));
        registeredMockPaths.length = 0;
    });

    it('should call createTaskLineModal with the app and allTasks', async () => {
        const app = createMockApp();
        const task1 = new TaskBuilder().description('Task 1').build();
        const tasks = [task1];
        const mockPlugin = {
            getTasks: () => tasks,
            app,
            saveSettings: vi.fn(),
        } as unknown as TasksPlugin;

        const publicApi = tasksApiV1(mockPlugin);

        await publicApi.createTaskLineModal();
        expect(createTaskLineModal).toHaveBeenCalledWith(app, tasks, expect.any(Function));
    });

    it('should call editTaskLineModal with the app, taskLine and allTasks', async () => {
        const app = createMockApp();
        const task1 = new TaskBuilder().description('Task 1').build();
        const tasks = [task1];
        const mockPlugin = {
            getTasks: () => tasks,
            app,
            saveSettings: vi.fn(),
        } as unknown as TasksPlugin;
        const taskLine = '- [ ] Task Name';

        const publicApi = tasksApiV1(mockPlugin);

        await publicApi.editTaskLineModal(taskLine);
        expect(editTaskLineModal).toHaveBeenCalledWith(app, taskLine, tasks, expect.any(Function));
    });

    describe('queryTasks metadata resolution and path handling', () => {
        it('should resolve frontmatter properties from metadataCache so query.file.property() works', () => {
            const mockTFile = createTFile('projects/active.md');
            const mockCache: CachedMetadata = {
                frontmatter: {
                    status: 'active',
                    priority: 'high',
                },
            };

            registerMockMetadata(mockCache, 'projects/active.md');

            const mockApp = createMockApp({
                vault: {
                    getFileByPath: vi.fn((path: string) => (path === 'projects/active.md' ? mockTFile : null)),
                },
                metadataCache: {
                    getFileCache: vi.fn((file: TFile) => (file === mockTFile ? mockCache : null)),
                },
            });

            const task1 = new TaskBuilder().description('Task 1').path('projects/active.md').build();
            const mockPlugin = {
                getTasks: () => [task1],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            const results = api.queryTasks(
                'filter by function query.file.property("status") === "active"',
                'projects/active.md',
            );
            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Task 1');
            expect(mockApp.vault.getFileByPath).toHaveBeenCalledWith('projects/active.md');
            expect(mockApp.metadataCache.getFileCache).toHaveBeenCalledWith(mockTFile);
        });

        it('should not match Archive/plan.md when passing non-existent Projects/plan.md, producing a path-only TasksFile', () => {
            const mockArchiveFile = createTFile('Archive/plan.md');
            const mockArchiveCache: CachedMetadata = {
                frontmatter: {
                    status: 'archived',
                },
            };
            registerMockMetadata(mockArchiveCache, 'Archive/plan.md');

            const mockApp = createMockApp({
                vault: {
                    getFileByPath: vi.fn((path: string) => (path === 'Archive/plan.md' ? mockArchiveFile : null)),
                },
                metadataCache: {
                    getFileCache: vi.fn((file: TFile) => (file === mockArchiveFile ? mockArchiveCache : null)),
                },
            });

            const task = new TaskBuilder().description('Task in plan').build();
            const mockPlugin = {
                getTasks: () => [task],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            // Projects/plan.md does not exist in vault; must NOT match Archive/plan.md
            const results = api.queryTasks(
                'filter by function query.file.path === "Projects/plan.md" && query.file.folder === "Projects/" && query.file.property("status") === null',
                'Projects/plan.md',
            );

            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Task in plan');
            expect(mockApp.vault.getFileByPath).toHaveBeenCalledWith('Projects/plan.md');
            expect(mockApp.metadataCache.getFileCache).not.toHaveBeenCalled();
        });

        it('should handle non-existent vault path by creating TasksFile without cached metadata', () => {
            const mockApp = createMockApp({
                vault: {
                    getFileByPath: vi.fn(() => null),
                },
                metadataCache: {
                    getFileCache: vi.fn(() => null),
                },
            });

            const task1 = new TaskBuilder().description('Task 1').build();
            const mockPlugin = {
                getTasks: () => [task1],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            // Path does not exist in vault, but TasksFile is created with path and empty metadata
            const results = api.queryTasks(
                'filter by function query.file.path === "notes/non-existent.md" && query.file.folder === "notes/" && query.file.property("any") === null',
                'notes/non-existent.md',
            );
            expect(results).toHaveLength(1);
            expect(results[0].description).toBe('Task 1');
            expect(mockApp.vault.getFileByPath).toHaveBeenCalledWith('notes/non-existent.md');
            expect(mockApp.metadataCache.getFileCache).not.toHaveBeenCalled();
        });

        it('should not query vault when queryPath is undefined or omitted', () => {
            const getFileByPath = vi.fn();
            const mockApp = createMockApp({
                vault: { getFileByPath },
            });

            const task = new TaskBuilder().description('General task').build();
            const mockPlugin = {
                getTasks: () => [task],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            // Omitted
            const resultsUndefined = api.queryTasks('not done');
            expect(resultsUndefined).toHaveLength(1);
            expect(getFileByPath).not.toHaveBeenCalled();

            // Explicit undefined
            const resultsExplicitUndefined = api.queryTasks('not done', undefined);
            expect(resultsExplicitUndefined).toHaveLength(1);
            expect(getFileByPath).not.toHaveBeenCalled();
        });

        it('should throw when Global Query contains file placeholder even if querySource has no placeholders and queryTasks is called without queryPath', () => {
            GlobalQuery.getInstance().set('path includes {{query.file.folder}}');

            const task = new TaskBuilder().description('Task').build();
            const mockApp = createMockApp();
            const mockPlugin = {
                getTasks: () => [task],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            expect(() => {
                api.queryTasks('not done');
            }).toThrowError(/placeholder/i);
        });

        it('should enforce runtime string check on querySource', () => {
            const mockApp = createMockApp();
            const mockPlugin = {
                getTasks: () => [],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            expect(() => {
                api.queryTasks(123 as unknown as string);
            }).toThrowError('queryTasks: querySource must be a string');

            expect(() => {
                api.queryTasks(null as unknown as string);
            }).toThrowError('queryTasks: querySource must be a string');

            expect(() => {
                api.queryTasks(undefined as unknown as string);
            }).toThrowError('queryTasks: querySource must be a string');
        });

        it('should enforce runtime string check on queryPath when provided', () => {
            const mockApp = createMockApp();
            const mockPlugin = {
                getTasks: () => [],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            expect(() => api.queryTasks('not done', 42 as any)).toThrow('queryTasks: queryPath must be a string');
            expect(() => api.queryTasks('not done', true as any)).toThrow('queryTasks: queryPath must be a string');
            expect(() => api.queryTasks('not done', {} as any)).toThrow('queryTasks: queryPath must be a string');
            expect(() => api.queryTasks('not done', [] as any)).toThrow('queryTasks: queryPath must be a string');
        });

        it('should pass empty string queryPath as-is to QueryRenderer.getTasksFile', () => {
            const mockApp = createMockApp({
                vault: {
                    getFileByPath: vi.fn(() => null),
                },
                metadataCache: {
                    getFileCache: vi.fn(() => null),
                },
            });

            const task1 = new TaskBuilder().description('Task 1').build();
            const mockPlugin = {
                getTasks: () => [task1],
                app: mockApp,
            } as unknown as TasksPlugin;

            const api = tasksApiV1(mockPlugin);

            const results = api.queryTasks('not done', '');
            expect(results).toHaveLength(1);
            expect(mockApp.vault.getFileByPath).toHaveBeenCalledWith('');
        });
    });
});
