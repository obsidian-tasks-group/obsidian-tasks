import type { ListItemCache, Pos } from 'obsidian';
import type { Task } from '../Task';
import type { TaskLocation } from '../TaskLocation';

/** a mock for {@link ListItemCache.task} */
type MockListItemCacheTask = string | undefined;

/** a mock for {@link Pos} */
type MockPos = Pos;

/** a mock for {@link ListItemCache} */
export type MockListItemCache = { task: string | undefined; position: Pos };
type MockListItemCaches = MockListItemCache[];

/** a mock for {@link Task} */
export type MockTask = {
    originalMarkdown: string;
    taskLocation: TaskLocation;
};

/** All the data required to call {@link findLineNumberOfTaskToToggle} */
export type MockTogglingDataForTesting = {
    cacheData: { listItemsCache: MockListItemCache[] };
    fileData: { fileLines: string[] };
    taskData: MockTask;
};

/**
 * This function can be used to save data that is used
 * when finding which line to toggle in a file.
 * @param originalTask
 * @param fileLines
 * @param listItemsCache
 */
export function getMockDataForTesting(
    originalTask: Task,
    fileLines: string[],
    listItemsCache: ListItemCache[],
): MockTogglingDataForTesting {
    const allDataFromListItemCache: MockListItemCaches = [];
    for (const listItemCache of listItemsCache) {
        const pos: MockPos = listItemCache.position;
        const task: MockListItemCacheTask = listItemCache.task;
        const dataFromListItemCache: MockListItemCache = {
            position: pos,
            task: task,
        };
        allDataFromListItemCache.push(dataFromListItemCache);
    }
    return {
        taskData: {
            originalMarkdown: originalTask.originalMarkdown,
            taskLocation: originalTask.taskLocation,
        },
        fileData: {
            fileLines: fileLines,
        },
        cacheData: {
            listItemsCache: allDataFromListItemCache,
        },
    };
}
