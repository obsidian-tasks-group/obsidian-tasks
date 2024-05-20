import type { ListItemCache, Pos } from 'obsidian';
import type { Task } from '../Task/Task';

// See File.test.ts for how to use this.

type MockTaskLocation = {
    path: string;
    lineNumber: number;
    sectionStart: number;
    sectionIndex: number;
    precedingHeader: string | null;
};

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
    taskLocation: MockTaskLocation;
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
 *
 * @see saveMockDataForTesting
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
    const mockTaskLocation: MockTaskLocation = {
        path: originalTask.taskLocation.path,
        lineNumber: originalTask.taskLocation.lineNumber,
        sectionStart: originalTask.taskLocation.sectionStart,
        sectionIndex: originalTask.taskLocation.sectionIndex,
        precedingHeader: originalTask.taskLocation.precedingHeader,
    };
    return {
        taskData: {
            originalMarkdown: originalTask.originalMarkdown,
            taskLocation: mockTaskLocation,
        },
        fileData: {
            fileLines: fileLines,
        },
        cacheData: {
            listItemsCache: allDataFromListItemCache,
        },
    };
}

/**
 * Write the supplied data to the console, so it can be saved for use in testing.
 *
 * @param originalTask
 * @param fileLines
 * @param listItemsCache
 */
export function saveMockDataForTesting(originalTask: Task, fileLines: string[], listItemsCache: ListItemCache[]) {
    const everything = getMockDataForTesting(originalTask, fileLines, listItemsCache);
    console.error(`Inconsistent lines: SAVE THE OUTPUT
data:
${JSON.stringify(everything)}
`);
}
