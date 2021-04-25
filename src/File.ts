import { ListItemCache, MetadataCache, Pos, TFile, Vault } from 'obsidian';

import { getSettings } from './Settings';
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

/** Supports multi-line positions, reduced to one line. */
export const mergeLineRangeIntoTaskLine = ({
    fileLines,
    position,
}: {
    fileLines: string[];
    position: Pos;
}) => {
    return fileLines
        .slice(
            position.start.line,
            position.end.line + 1, // End has same zero-based index as start.
        )
        .reduce((accumulator: string, value: string) => {
            // Do not trim indentation:
            if (accumulator === '') {
                value = value.trimEnd();
            } else {
                value = value.trim();
            }

            accumulator = accumulator + value + ' ';

            return accumulator;
        }, '')
        .trimEnd();
};

/**
 * Replaces the original task with one or more new tassk.
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

    const file = vault.getAbstractFileByPath(originalTask.path);
    if (!(file instanceof TFile)) {
        return;
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache === null) {
        return;
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        return;
    }

    const fileContent = await vault.cachedRead(file);
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

        const line = mergeLineRangeIntoTaskLine({
            fileLines,
            position: listItemCache.position,
        });

        if (line.includes(globalFilter)) {
            if (sectionIndex === originalTask.sectionIndex) {
                listItem = listItemCache;
                break;
            }

            sectionIndex++;
        }
    }
    if (listItem === undefined) {
        return;
    }

    const updatedFileLines = [
        ...fileLines.slice(0, listItem.position.start.line),
        ...newTasks.map((task: Task) => task.toFileLineString()),
        ...fileLines.slice(listItem.position.end.line + 1), // End has same zero-based index as start.
    ];

    await vault.modify(file, updatedFileLines.join('\n'));
};
