import type { CachedMetadata } from 'obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';

export function createTestTasksFile(path: string, cachedMetadata: CachedMetadata = {}): TasksFile {
    return new TasksFile(path, cachedMetadata);
}
