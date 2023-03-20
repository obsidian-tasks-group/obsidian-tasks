import { type ListItemCache, MarkdownView, MetadataCache, Notice, TFile, Vault, Workspace } from 'obsidian';

import { getSettings } from './Config/Settings';
import { type MockListItemCache, type MockTask, saveMockDataForTesting } from './lib/MockDataCreator';
import type { Task } from './Task';

let metadataCache: MetadataCache | undefined;
let vault: Vault | undefined;
let workspace: Workspace | undefined;

/** the two lists below must be maintained together. */
const supportedFileExtensions = ['md'];
const supportedViewTypes = [MarkdownView];

export type ErrorLoggingFunction = (message: string) => void;

export const initializeFile = ({
    metadataCache: newMetadataCache,
    vault: newVault,
    workspace: newWorkspace,
}: {
    metadataCache: MetadataCache;
    vault: Vault;
    workspace: Workspace;
}) => {
    metadataCache = newMetadataCache;
    vault = newVault;
    workspace = newWorkspace;
};

/**
 * Replaces the original task with one or more new tasks.
 *
 * If you pass more than one replacement task, all subsequent tasks in the same
 * section must be re-rendered, as their section indexes change. Assuming that
 * this is done faster than user interaction in practice.
 *
 * In addition, this function is meant to be called with reasonable confidence
 * that the {@code originalTask} is unmodified and at the exact same section and
 * sectionIdx in the source file it was originally found in. It will fail otherwise.
 */
export const replaceTaskWithTasks = async ({
    originalTask,
    newTasks,
}: {
    originalTask: Task;
    newTasks: Task | Task[];
}): Promise<void> => {
    if (vault === undefined || metadataCache === undefined || workspace === undefined) {
        errorAndNotice('Tasks: cannot use File before initializing it.');
        return;
    }

    if (!Array.isArray(newTasks)) {
        newTasks = [newTasks];
    }

    console.log(`\n\nreplaceTaskWithTasks entered.\n${originalTask.path}`);

    tryRepetitive({
        originalTask,
        newTasks,
        vault,
        metadataCache,
        workspace,
        previousTries: 0,
    });
};

function errorAndNotice(message: string) {
    console.error(message);
    new Notice(message, 10000);
}

function warnAndNotice(message: string) {
    console.warn(message);
    new Notice(message, 10000);
}

function doNothing(_: string) {}

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
    workspace,
    previousTries,
}: {
    originalTask: Task;
    newTasks: Task[];
    vault: Vault;
    metadataCache: MetadataCache;
    workspace: Workspace;
    previousTries: number;
}): Promise<void> => {
    console.debug(`tryRepetitive after ${previousTries} previous tries`);
    const retry = () => {
        if (previousTries > 10) {
            errorAndNotice('Tasks: Too many retries. File update not possible ...');
            return;
        }

        const timeout = Math.min(Math.pow(10, previousTries), 100); // 1, 10, 100, 100, 100, ...
        setTimeout(() => {
            tryRepetitive({
                originalTask,
                newTasks,
                vault,
                metadataCache,
                workspace,
                previousTries: previousTries + 1,
            });
        }, timeout);
    };

    const file = vault.getAbstractFileByPath(originalTask.path);
    if (!(file instanceof TFile)) {
        warnAndNotice(`Tasks: No file found for task ${originalTask.description}. Retrying ...`);
        return retry();
    }

    if (!supportedFileExtensions.includes(file.extension)) {
        errorAndNotice(`Tasks: Does not support files with the ${file.extension} file extension.`);
        return;
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache == undefined || fileCache === null) {
        warnAndNotice(`Tasks: No file cache found for file ${file.path}. Retrying ...`);
        return retry();
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        warnAndNotice(`Tasks: No list items found in file cache of ${file.path}. Retrying ...`);
        return retry();
    }

    // before reading the file, save all open views which may contain dirty data not yet saved to filesys.
    if (previousTries === 0) {
        console.debug(`File auto-saving for:\n${file.path}`);
        // TODO: future opt is save only if some dirty bit is set.
        const promises: Promise<void>[] = [];
        workspace.iterateAllLeaves((leaf) => {
            supportedViewTypes.forEach((viewType) => {
                if (leaf.view instanceof viewType && leaf.view.file.path === file.path) {
                    promises.push(leaf.view.save());
                }
            });
        });
        await Promise.all(promises);
    }

    const fileContent = await vault.read(file); // TODO: replace with vault.process.
    const fileLines = fileContent.split('\n');

    const taskLineNumber = findLineNumberOfTaskToToggle(originalTask, fileLines, listItemsCache, doNothing);

    if (taskLineNumber === undefined) {
        const logDataForMocking = false;
        if (logDataForMocking) {
            // There was an error finding the correct line to toggle,
            // so write out to the console a representation of the data needed to reconstruct the above
            // findLineNumberOfTaskToToggle() call, so that the content can be saved
            // to a JSON file and then re-used in a 'unit' test.
            saveMockDataForTesting(originalTask, fileLines, listItemsCache);
        }
        // errorAndNotice('Tasks: could not find task to toggle in the file.');
        return retry();
    }

    const updatedFileLines = [
        ...fileLines.slice(0, taskLineNumber),
        ...newTasks.map((task: Task) => task.toFileLineString()),
        ...fileLines.slice(taskLineNumber + 1), // Only supports single-line tasks.
    ];

    await vault.modify(file, updatedFileLines.join('\n'));
};

/**
 * Try to find the line number of the originalTask
 * @param originalTask - the {@link Task} line that the user clicked on
 * @param fileLines - the lines read from the file.
 * @param listItemsCache
 * @param errorLoggingFunction - a function of type {@link ErrorLoggingFunction} - which will be called if the found
 *                               line differs from the original markdown in {@link originalTask}.
 *                               This parameter is provided to allow tests to be written for this code
 *                               that do not display a popup warning, but instead capture the error message.
 */
export function findLineNumberOfTaskToToggle(
    originalTask: Task | MockTask,
    fileLines: string[],
    listItemsCache: ListItemCache[] | MockListItemCache[],
    errorLoggingFunction: ErrorLoggingFunction,
) {
    const fileLinesCount = fileLines.length;
    const { globalFilter } = getSettings();
    let taskLineNumber: number | undefined;
    let sectionIndex = 0;
    for (const listItemCache of listItemsCache) {
        const listItemLineNumber = listItemCache.position.start.line;
        if (listItemLineNumber >= fileLinesCount) {
            // One or more lines has been deleted since the cache was populated,
            // so there is at least one list item in the cache that is beyond
            // the end of the actual file on disk.
            return undefined;
        }

        if (listItemLineNumber < originalTask.taskLocation.sectionStart) {
            continue;
        }

        if (listItemCache.task === undefined) {
            continue;
        }

        const line = fileLines[listItemLineNumber];
        if (line.includes(globalFilter)) {
            if (sectionIndex === originalTask.taskLocation.sectionIndex) {
                if (line === originalTask.originalMarkdown) {
                    taskLineNumber = listItemLineNumber;
                } else {
                    errorLoggingFunction(
                        `Tasks: Unable to find task in file ${originalTask.taskLocation.path}.
Expected task:
${originalTask.originalMarkdown}
Found task:
${line}`,
                    );
                    return;
                }
                break;
            }

            sectionIndex++;
        }
    }
    return taskLineNumber;
}
