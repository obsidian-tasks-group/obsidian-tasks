import type { CachedMetadata } from 'obsidian';
import { setCurrentCacheFile } from '../__mocks__/obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';

/**
 * @file This file provides functions for testing {@link TasksFile} from data in `tests/Obsidian/__test_data__`.
 *
 * - See [Background information](https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests).
 * - See also {@link SimulatedFile} and {@link readTasksFromSimulatedFile}.
 */

export function getTasksFileFromMockData(data: any) {
    setCurrentCacheFile(data);
    const cachedMetadata = data.cachedMetadata as CachedMetadata;
    return new TasksFile(data.filePath, cachedMetadata);
}

export function listPathAndData(inputs: any[]) {
    // We use map() to extract the path, to use it as a test name in it.each()
    return inputs.map((data) => [data.filePath, data]);
}
