import { MetadataCache, TFile, Vault } from 'obsidian';
import type { ListItemCache } from 'obsidian';

import { getSettings } from './Config/Settings';
import type { Task } from './Task';

let metadataCache: MetadataCache | undefined;
let vault: Vault | undefined;

export const initializeFile = ({
    metadataCache: newMetadataCache,
    vault: newVault,
}: {
    metadataCache: MetadataCache;
    vault: Vault;
}) => {
    metadataCache = newMetadataCache;
    vault = newVault;
};

/**
 * Replaces the original task with one or more new tasks.
 *
 * If you pass more than one replacement task, all subsequent tasks in the same
 * section must be re-rendered, as their section indexes change. Assuming that
 * this is done faster than user interaction in practice.
 */
export const replaceTaskWithTasks = async ({
    originalTask,
    newTasks,
}: {
    originalTask: Task;
    newTasks: Task | Task[];
}): Promise<void> => {
    if (vault === undefined || metadataCache === undefined) {
        console.error('Tasks: cannot use File before initializing it.');
        return;
    }

    if (!Array.isArray(newTasks)) {
        newTasks = [newTasks];
    }

    tryRepetitive({
        originalTask,
        newTasks,
        vault,
        metadataCache,
        previousTries: 0,
    });
};

class ErrorWorthRetrying extends Error {}

/**
 * This is a workaround to re-try when the returned file cache is `undefined`.
 * Retrying after a while may return a valid file cache.
 * Reported in https://github.com/obsidian-tasks-group/obsidian-tasks/issues/87
 */
const tryRepetitive = async ({
    originalTask,
    newTasks,
    vault,
    metadataCache,
    previousTries,
}: {
    originalTask: Task;
    newTasks: Task[];
    vault: Vault;
    metadataCache: MetadataCache;
    previousTries: number;
}): Promise<void> => {
    const retry = () => {
        if (previousTries > 10) {
            console.error('Tasks: Too many retries. File update not possible ...');
            return;
        }

        const timeout = Math.min(Math.pow(10, previousTries), 100); // 1, 10, 100, 100, 100, ...
        setTimeout(() => {
            tryRepetitive({
                originalTask,
                newTasks,
                vault,
                metadataCache,
                previousTries: previousTries + 1,
            });
        }, timeout);
    };

    try {
        const result = await getTaskListItemInFile(originalTask, metadataCache, vault);
        if (result === undefined) {
            console.error('Tasks: could not find task to toggle in the file.');
            return;
        }
        const [listItem, fileLines, file] = result;

        const updatedFileLines = [
            ...fileLines.slice(0, listItem.position.start.line),
            ...newTasks.map((task: Task) => task.toFileLineString()),
            ...fileLines.slice(listItem.position.start.line + 1), // Only supports single-line tasks.
        ];

        await vault.modify(file, updatedFileLines.join('\n'));
    } catch (error) {
        if (error instanceof ErrorWorthRetrying) {
            console.warn(error.message);
            retry();
        }
        return;
    }
};

export async function getTaskFileAndLine(task: Task): Promise<[TFile, number] | undefined> {
    if (!metadataCache || !vault) {
        console.error('Unable to get task file due to uninitialized metadata or vault:', metadataCache, vault);
        return undefined;
    }
    const item = await getTaskListItemInFile(task, metadataCache, vault);
    if (item) {
        const [listItem, _, file] = item;
        return [file, listItem.position.start.line];
    } else return undefined;
}

/**
 * Find the file line on which the task is defined.
 * It is done by iterating over Obsidian's listItems cache, counting the list items in the section that the
 * task belongs to (according to sectionStart), and comparing to the task's stored sectionIndex.
 * Since this is used as part of a context that can retry a few times, some errors are considered "worth retrying",
 * see the documentation for tryRepetitive above.
 */
async function getTaskListItemInFile(
    task: Task,
    metadataCache: MetadataCache,
    vault: Vault,
): Promise<[ListItemCache, string[], TFile] | undefined> {
    const file = vault.getAbstractFileByPath(task.path);
    if (!(file instanceof TFile)) {
        throw new ErrorWorthRetrying(`Tasks: No file found for task ${task.description}. Retrying ...`);
    }

    if (file.extension !== 'md') {
        console.error('Tasks: Only supporting files with the .md file extension.');
        return undefined;
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache == undefined || fileCache === null) {
        throw new ErrorWorthRetrying(`Tasks: No file cache found for file ${file.path}. Retrying ...`);
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        throw new ErrorWorthRetrying(`Tasks: No list items found in file cache of ${file.path}. Retrying ...`);
    }

    const fileContent = await vault.read(file);
    const fileLines = fileContent.split('\n');

    const { globalFilter } = getSettings();
    let listItem: ListItemCache | undefined;
    let sectionIndex = 0;
    for (const listItemCache of listItemsCache) {
        if (listItemCache.position.start.line < task.sectionStart) {
            continue;
        }

        if (listItemCache.task === undefined) {
            continue;
        }

        const line = fileLines[listItemCache.position.start.line];

        if (line.includes(globalFilter)) {
            if (sectionIndex === task.sectionIndex) {
                listItem = listItemCache;
                break;
            }

            sectionIndex++;
        }
    }
    if (listItem) return [listItem, fileLines, file];
    else return undefined;
}
