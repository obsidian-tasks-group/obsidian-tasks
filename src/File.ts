import { MarkdownView, MetadataCache, TFile, Vault, Workspace } from 'obsidian';
import type { ListItemCache } from 'obsidian';

import { getSettings } from './Config/Settings';
import type { Task } from './Task';

let metadataCache: MetadataCache | undefined;
let vault: Vault | undefined;
let workspace: Workspace | undefined;

/** the two lists below must be maintained together. */
const supportedFileExtensions = ['md'];
const supportedViewTypes = [MarkdownView];

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
        workspace,
        previousTries: 0,
    });
};

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
                workspace,
                previousTries: previousTries + 1,
            });
        }, timeout);
    };

    const file = vault.getAbstractFileByPath(originalTask.path);
    if (!(file instanceof TFile)) {
        console.warn(`Tasks: No file found for task ${originalTask.description}. Retrying ...`);
        return retry();
    }

    if (!supportedFileExtensions.includes(file.extension)) {
        console.error(`Tasks: Does not support files with the ${file.extension} file extension.`);
        return;
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache == undefined || fileCache === null) {
        console.warn(`Tasks: No file cache found for file ${file.path}. Retrying ...`);
        return retry();
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        console.warn(`Tasks: No list items found in file cache of ${file.path}. Retrying ...`);
        return retry();
    }

    // before reading the file, save all open views which may contain dirty data not yet saved to filesys.
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

    const fileContent = await vault.read(file); // TODO: replace with vault.process.
    const fileLines = fileContent.split('\n');

    const { globalFilter } = getSettings();
    let listItem: ListItemCache | undefined;
    let sectionIndex = 0;
    for (const listItemCache of listItemsCache) {
        if (listItemCache.position.start.line < originalTask.sectionStart) {
            continue;
        }

        if (listItemCache.task === undefined) {
            continue;
        }

        const line = fileLines[listItemCache.position.start.line];
        if (line.includes(globalFilter)) {
            if (sectionIndex === originalTask.sectionIndex) {
                if (line === originalTask.originalMarkdown) {
                    listItem = listItemCache;
                } else {
                    console.error(
                        `Tasks: Unable to find task in file ${originalTask.path}.\n` +
                            `Expected task:\n${originalTask.toFileLineString()}.\nFound task:\n${line}.`,
                    );
                    return;
                }
                break;
            }

            sectionIndex++;
        }
    }
    if (listItem === undefined) {
        console.error('Tasks: could not find task to toggle in the file.');
        return;
    }

    const updatedFileLines = [
        ...fileLines.slice(0, listItem.position.start.line),
        ...newTasks.map((task: Task) => task.toFileLineString()),
        ...fileLines.slice(listItem.position.start.line + 1), // Only supports single-line tasks.
    ];

    await vault.modify(file, updatedFileLines.join('\n'));
};
