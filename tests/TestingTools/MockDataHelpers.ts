import type { CachedMetadata } from 'obsidian';
import { setCurrentCacheFile } from '../__mocks__/obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';

// For explanation of the mock data, see Cache.test.ts.

export function getTasksFileFromMockData(data: any) {
    setCurrentCacheFile(data);
    const cachedMetadata = data.cachedMetadata as CachedMetadata;
    return new TasksFile(data.filePath, cachedMetadata);
}

export function listPathAndData(inputs: any[]) {
    // We use map() to extract the path, to use it as a test name in it.each()
    return inputs.map((data) => [data.filePath, data]);
}
