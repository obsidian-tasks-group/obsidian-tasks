import type { TFile } from 'obsidian';
import type { ExtendedMetadataCacheAPI } from 'obsidian-extended-metadatacache';
import { Cache } from '../../src/Obsidian/Cache';
import type { Task } from '../../src/Task/Task';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

function makeTFile(path: string): TFile {
    const basename = path.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
    return { path, basename } as TFile;
}

function makeExtendedCache(opts: { isReady: boolean; filesWithTasks: Set<string> }): ExtendedMetadataCacheAPI {
    return {
        isReady: opts.isReady,
        getFilesWithTasks: () => opts.filesWithTasks,
    } as unknown as ExtendedMetadataCacheAPI;
}

function makeTask(path: string, description: string): Task {
    return new TaskBuilder().path(path).description(description).build();
}

describe('Cache.filterFilesToIndex', () => {
    const fileA = makeTFile('notes/a.md');
    const fileB = makeTFile('notes/b.md');
    const fileC = makeTFile('projects/c.md');
    const allFiles = [fileA, fileB, fileC];

    it('should return all files when no extended cache is provided', () => {
        const result = Cache.filterFilesToIndex(allFiles, undefined);
        expect(result).toEqual(allFiles);
    });

    it('should return all files when extended cache is not ready', () => {
        const cache = makeExtendedCache({ isReady: false, filesWithTasks: new Set(['notes/a.md']) });
        const result = Cache.filterFilesToIndex(allFiles, cache);
        expect(result).toEqual(allFiles);
    });

    it('should return all files when extended cache reports empty task set', () => {
        const cache = makeExtendedCache({ isReady: true, filesWithTasks: new Set() });
        const result = Cache.filterFilesToIndex(allFiles, cache);
        expect(result).toEqual(allFiles);
    });

    it('should filter to only files with tasks when extended cache is ready', () => {
        const cache = makeExtendedCache({ isReady: true, filesWithTasks: new Set(['notes/a.md', 'projects/c.md']) });
        const result = Cache.filterFilesToIndex(allFiles, cache);
        expect(result).toEqual([fileA, fileC]);
    });

    it('should return empty array when no files match the task set', () => {
        const cache = makeExtendedCache({ isReady: true, filesWithTasks: new Set(['nonexistent/x.md']) });
        const result = Cache.filterFilesToIndex(allFiles, cache);
        expect(result).toEqual([]);
    });

    it('should handle single file matching', () => {
        const cache = makeExtendedCache({ isReady: true, filesWithTasks: new Set(['notes/b.md']) });
        const result = Cache.filterFilesToIndex(allFiles, cache);
        expect(result).toEqual([fileB]);
    });

    it('should return all files when all match', () => {
        const cache = makeExtendedCache({
            isReady: true,
            filesWithTasks: new Set(['notes/a.md', 'notes/b.md', 'projects/c.md']),
        });
        const result = Cache.filterFilesToIndex(allFiles, cache);
        expect(result).toEqual(allFiles);
    });

    it('should handle empty file list', () => {
        const cache = makeExtendedCache({ isReady: true, filesWithTasks: new Set(['notes/a.md']) });
        const result = Cache.filterFilesToIndex([], cache);
        expect(result).toEqual([]);
    });
});

describe('Cache.removeTasksForPathFromArray', () => {
    it('should remove tasks for an existing path', () => {
        const taskA1 = makeTask('a.md', 'task A1');
        const taskA2 = makeTask('a.md', 'task A2');
        const taskB1 = makeTask('b.md', 'task B1');
        const tasks = [taskA1, taskA2, taskB1];
        const tasksByPath = new Map<string, Task[]>([
            ['a.md', [taskA1, taskA2]],
            ['b.md', [taskB1]],
        ]);

        const result = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'a.md');

        expect(result).toEqual([taskB1]);
        expect(tasksByPath.has('a.md')).toBe(false);
        expect(tasksByPath.get('b.md')).toEqual([taskB1]);
    });

    it('should be a no-op for a path with no tasks', () => {
        const taskA = makeTask('a.md', 'task A');
        const tasks = [taskA];
        const tasksByPath = new Map<string, Task[]>([['a.md', [taskA]]]);

        const result = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'nonexistent.md');

        expect(result).toEqual([taskA]);
        expect(tasksByPath.get('a.md')).toEqual([taskA]);
    });

    it('should handle path in map with empty task array', () => {
        const taskA = makeTask('a.md', 'task A');
        const tasks = [taskA];
        const tasksByPath = new Map<string, Task[]>([
            ['a.md', [taskA]],
            ['empty.md', []],
        ]);

        const result = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'empty.md');

        expect(result).toEqual([taskA]);
        expect(tasksByPath.has('empty.md')).toBe(false);
    });

    it('should be idempotent when called twice for the same path', () => {
        const taskA = makeTask('a.md', 'task A');
        const taskB = makeTask('b.md', 'task B');
        const tasks = [taskA, taskB];
        const tasksByPath = new Map<string, Task[]>([
            ['a.md', [taskA]],
            ['b.md', [taskB]],
        ]);

        let result = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'a.md');
        result = Cache.removeTasksForPathFromArray(result, tasksByPath, 'a.md');

        expect(result).toEqual([taskB]);
        expect(tasksByPath.has('a.md')).toBe(false);
        expect(tasksByPath.get('b.md')).toEqual([taskB]);
    });

    it('should remove all tasks when all belong to the same path', () => {
        const task1 = makeTask('only.md', 'task 1');
        const task2 = makeTask('only.md', 'task 2');
        const tasks = [task1, task2];
        const tasksByPath = new Map<string, Task[]>([['only.md', [task1, task2]]]);

        const result = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'only.md');

        expect(result).toEqual([]);
        expect(tasksByPath.size).toBe(0);
    });

    it('should handle empty tasks array and empty map', () => {
        const tasksByPath = new Map<string, Task[]>();
        const result = Cache.removeTasksForPathFromArray([], tasksByPath, 'any.md');

        expect(result).toEqual([]);
        expect(tasksByPath.size).toBe(0);
    });

    it('should preserve task ordering of remaining tasks', () => {
        const taskA = makeTask('a.md', 'A');
        const taskB1 = makeTask('b.md', 'B1');
        const taskC = makeTask('c.md', 'C');
        const taskB2 = makeTask('b.md', 'B2');
        const taskD = makeTask('d.md', 'D');
        const tasks = [taskA, taskB1, taskC, taskB2, taskD];
        const tasksByPath = new Map<string, Task[]>([
            ['a.md', [taskA]],
            ['b.md', [taskB1, taskB2]],
            ['c.md', [taskC]],
            ['d.md', [taskD]],
        ]);

        const result = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'b.md');

        expect(result.map((t) => t.description)).toEqual(['A', 'C', 'D']);
    });
});

describe('tasksByPath consistency', () => {
    it('should maintain consistency after sequential add and remove operations', () => {
        const taskA = makeTask('a.md', 'A');
        const taskB = makeTask('b.md', 'B');
        const taskC = makeTask('c.md', 'C');

        let tasks: Task[] = [];
        const tasksByPath = new Map<string, Task[]>();

        tasks.push(taskA);
        tasksByPath.set('a.md', [taskA]);
        tasks.push(taskB);
        tasksByPath.set('b.md', [taskB]);
        tasks.push(taskC);
        tasksByPath.set('c.md', [taskC]);

        expect(tasks.length).toBe(3);
        expect(tasksByPath.size).toBe(3);

        tasks = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'b.md');

        expect(tasks.length).toBe(2);
        expect(tasksByPath.size).toBe(2);
        expect(tasks.map((t) => t.description)).toEqual(['A', 'C']);

        const taskB2 = makeTask('b.md', 'B2');
        tasks.push(taskB2);
        tasksByPath.set('b.md', [taskB2]);

        expect(tasks.length).toBe(3);
        expect(tasksByPath.size).toBe(3);
        expect(tasksByPath.get('b.md')).toEqual([taskB2]);
    });

    it('should keep map and array in sync after replacing tasks for a path', () => {
        const taskA1 = makeTask('a.md', 'old task');
        let tasks: Task[] = [taskA1];
        const tasksByPath = new Map<string, Task[]>([['a.md', [taskA1]]]);

        tasks = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'a.md');

        const taskA2 = makeTask('a.md', 'new task');
        const taskA3 = makeTask('a.md', 'another new task');
        tasks.push(taskA2, taskA3);
        tasksByPath.set('a.md', [taskA2, taskA3]);

        expect(tasks.length).toBe(2);
        expect(tasksByPath.get('a.md')).toEqual([taskA2, taskA3]);
        expect(tasks.every((t) => t.path === 'a.md')).toBe(true);
    });

    it('should simulate rename: remove old path, add new path', () => {
        const task = makeTask('old/path.md', 'my task');
        let tasks: Task[] = [task];
        const tasksByPath = new Map<string, Task[]>([['old/path.md', [task]]]);

        tasks = Cache.removeTasksForPathFromArray(tasks, tasksByPath, 'old/path.md');
        expect(tasks.length).toBe(0);
        expect(tasksByPath.has('old/path.md')).toBe(false);

        const renamedTask = new TaskBuilder().path('new/path.md').description('my task').build();
        tasks.push(renamedTask);
        tasksByPath.set('new/path.md', [renamedTask]);

        expect(tasks.length).toBe(1);
        expect(tasksByPath.has('new/path.md')).toBe(true);
        expect(tasksByPath.has('old/path.md')).toBe(false);
    });
});
