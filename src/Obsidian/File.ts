import { type CachedMetadata, type ListItemCache, MetadataCache, Notice, TFile, Vault, Workspace } from 'obsidian';
import { GlobalFilter } from '../Config/GlobalFilter';
import { type MockListItemCache, type MockTask, saveMockDataForTesting } from '../lib/MockDataCreator';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { logging } from '../lib/logging';
import { logEndOfTaskEdit, logStartOfTaskEdit } from '../lib/LogTasksHelper';

let metadataCache: MetadataCache | undefined;
let vault: Vault | undefined;
let workspace: Workspace | undefined;

const supportedFileExtensions = ['md'];

function getFileLogger() {
    // For logging to actually produce debug output when enabled in settings,
    // it appears that the logger cannot be created until execution time.
    return logging.getLogger('tasks.File');
}

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
    originalTask: ListItem;
    newTasks: ListItem | ListItem[];
}): Promise<void> => {
    if (vault === undefined || metadataCache === undefined || workspace === undefined) {
        errorAndNotice('Tasks: cannot use File before initializing it.');
        return;
    }

    if (!Array.isArray(newTasks)) {
        newTasks = [newTasks];
    }

    const logger = getFileLogger();
    const codeLocation = 'replaceTaskWithTasks()';
    logStartOfTaskEdit(logger, codeLocation, originalTask);
    logEndOfTaskEdit(logger, codeLocation, newTasks);

    await tryRepetitive({
        originalTask,
        newTasks,
        vault,
        metadataCache,
        workspace,
        previousTries: 0,
    });
};

/**
 * @todo Unify this with {@link showError} in EditorSuggestorPopup.ts
 * @param message
 */
function errorAndNotice(message: string) {
    console.error(message);
    new Notice(message, 15000);
}

function warnAndNotice(message: string) {
    console.warn(message);
    new Notice(message, 10000);
}

function debugLog(message: string) {
    const logger = getFileLogger();
    logger.debug(message);
}

// When this exception is thrown, it is meant to indicate that the caller should consider to try the operation
// again soon
class WarningWorthRetrying extends Error {}
// Same as above, but be silent about it
class RetryWithoutWarning extends Error {}

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
    originalTask: ListItem;
    newTasks: ListItem[];
    vault: Vault;
    metadataCache: MetadataCache;
    workspace: Workspace;
    previousTries: number;
}): Promise<void> => {
    const logger = getFileLogger();
    logger.debug(`tryRepetitive after ${previousTries} previous tries`);
    const retry = async () => {
        if (previousTries > 10) {
            const message = `Tasks: Could not find the correct task line to update.

The task line not updated is:
${originalTask.originalMarkdown}

In this markdown file:
"${originalTask.taskLocation.path}"

Note: further clicks on this checkbox will usually now be ignored until the file is opened (or certain, specific edits are made - it's complicated).

Recommendations:

1. Close all panes that have the above file open, and then re-open the file.

2. Check for exactly identical copies of the task line, in this file, and see if you can make them different.
`;
            errorAndNotice(message);
            return;
        }

        const timeout = Math.min(Math.pow(10, previousTries), 100); // 1, 10, 100, 100, 100, ...
        logger.debug(`timeout = ${timeout}`);
        setTimeout(async () => {
            await tryRepetitive({
                originalTask,
                newTasks,
                vault,
                metadataCache,
                workspace,
                previousTries: previousTries + 1,
            });
        }, timeout);
    };

    try {
        const [taskLineNumber, file, fileLines] = await getTaskAndFileLines(originalTask, vault);
        // Finally, we can insert 1 or more lines over the original task line:
        const updatedFileLines = [
            ...fileLines.slice(0, taskLineNumber),
            ...newTasks.map((task: ListItem) => task.toFileLineString()),
            ...fileLines.slice(taskLineNumber + 1), // Only supports single-line tasks.
        ];

        await vault.modify(file, updatedFileLines.join('\n'));
    } catch (e) {
        if (e instanceof WarningWorthRetrying) {
            if (e.message) warnAndNotice(e.message);
            await retry();
            return;
        } else if (e instanceof RetryWithoutWarning) {
            await retry();
            return;
        } else if (e instanceof Error) {
            errorAndNotice(e.message);
        }
    }
};

/*
 * This method returns the line on which `task` is defined, together with the file it is defined in, and the
 * lines of that file, possibly for the purpose of updating the task in the file or jumping to it.
 * It may throw a WarningWorthRetrying exception in several cases that justify a retry (should be handled by the caller)
 * or an Error exception in case of an unrecoverable error.
 */
async function getTaskAndFileLines(task: ListItem, vault: Vault): Promise<[number, TFile, string[]]> {
    if (metadataCache === undefined) throw new WarningWorthRetrying();
    // Validate our inputs.
    // For permanent failures, return nothing.
    // For failures that might be fixed if we wait for a little while, return retry().
    const file = vault.getAbstractFileByPath(task.path);
    if (!(file instanceof TFile)) {
        throw new WarningWorthRetrying(`Tasks: No file found for task ${task.description}. Retrying ...`);
    }

    if (!supportedFileExtensions.includes(file.extension)) {
        throw new Error(`Tasks: Does not support files with the ${file.extension} file extension.`);
    }

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache == undefined || fileCache === null) {
        throw new WarningWorthRetrying(`Tasks: No file cache found for file ${file.path}. Retrying ...`);
    }

    const listItemsCache = fileCache.listItems;
    if (listItemsCache === undefined || listItemsCache.length === 0) {
        throw new WarningWorthRetrying(`Tasks: No list items found in file cache of ${file.path}. Retrying ...`);
    }

    // We can now try and find which line in the file currently contains originalTask,
    // so that we know which line to update.
    const fileContent = await vault.read(file); // TODO: replace with vault.process.
    const fileLines = fileContent.split('\n');
    const taskLineNumber = findLineNumberOfTaskToToggle(task, fileLines, listItemsCache, debugLog);

    if (taskLineNumber === undefined) {
        const logDataForMocking = false;
        if (logDataForMocking) {
            // There was an error finding the correct line to toggle,
            // so write out to the console a representation of the data needed to reconstruct the above
            // findLineNumberOfTaskToToggle() call, so that the content can be saved
            // to a JSON file and then re-used in a 'unit' test.
            saveMockDataForTesting(task, fileLines, listItemsCache);
        }
        throw new RetryWithoutWarning();
    }
    return [taskLineNumber, file, fileLines];
}

// A simpler version of the method above, which doesn't return the lines of the file, and handles exceptions
// internally rather than throw them to the outside
export async function getTaskLineAndFile(task: Task, vault: Vault): Promise<[number, TFile] | undefined> {
    try {
        const [taskLineNumber, file, _] = await getTaskAndFileLines(task, vault);
        return [taskLineNumber, file];
    } catch (e) {
        if (e instanceof WarningWorthRetrying) {
            if (e.message) warnAndNotice(e.message);
        } else if (e instanceof Error) {
            errorAndNotice(e.message);
        }
    }
    return undefined;
}

function isValidLineNumber(listItemLineNumber: number, fileLines: string[]) {
    return listItemLineNumber < fileLines.length;
}

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
): number | undefined {
    let result: number | undefined = tryFindingExactMatchAtOriginalLineNumber(originalTask, fileLines);
    if (result !== undefined) {
        return result;
    }

    result = tryFindingIdenticalUniqueMarkdownLineInFile(originalTask, fileLines);
    if (result !== undefined) {
        return result;
    }

    return tryFindingLineNumberFromTaskSectionInfo(originalTask, fileLines, listItemsCache, errorLoggingFunction);
}

/**
 *  If the line at line number in originalTask matches original markdown,
 *  treat that as the correct answer.
 *
 *  This could go wrong if:
 *     - Some lines have been added since originalTask was rendered in Reading view,
 *       and an identical task line was added, that happened by coincidence to be in the same
 *       line number as the original task.
 *
 * @param originalTask
 * @param fileLines
 */
function tryFindingExactMatchAtOriginalLineNumber(originalTask: Task | MockTask, fileLines: string[]) {
    const originalTaskLineNumber = originalTask.taskLocation.lineNumber;
    if (isValidLineNumber(originalTaskLineNumber, fileLines)) {
        if (fileLines[originalTaskLineNumber] === originalTask.originalMarkdown) {
            const logger = getFileLogger();
            logger.debug(`Found original markdown at original line number ${originalTaskLineNumber}`);
            return originalTaskLineNumber;
        }
    }
    return undefined;
}

/**
 * If the line only appears once in the file, use that line number.
 *
 * This could go wrong if:
 *    - the user had commented out the original task line, and the section had not yet been redrawn
 * @param originalTask
 * @param fileLines
 */
function tryFindingIdenticalUniqueMarkdownLineInFile(originalTask: Task | MockTask, fileLines: string[]) {
    const matchingLineNumbers = [];
    for (let i = 0; i < fileLines.length; i++) {
        if (fileLines[i] === originalTask.originalMarkdown) {
            matchingLineNumbers.push(i);
        }
    }
    if (matchingLineNumbers.length === 1) {
        // There is only one instance of the line in the file, so it must be the
        // line we are looking for.
        return matchingLineNumbers[0];
    }
    return undefined;
}

/**
 * Fall back on the original algorithm, which uses the section information inside the task's {@link TaskLocation}.
 *
 * @param originalTask
 * @param fileLines
 * @param listItemsCache
 * @param errorLoggingFunction
 */
function tryFindingLineNumberFromTaskSectionInfo(
    originalTask: Task | MockTask,
    fileLines: string[],
    listItemsCache: ListItemCache[] | MockListItemCache[],
    errorLoggingFunction: ErrorLoggingFunction,
) {
    let taskLineNumber: number | undefined;
    let sectionIndex = 0;
    for (const listItemCache of listItemsCache) {
        const listItemLineNumber = listItemCache.position.start.line;
        if (!isValidLineNumber(listItemLineNumber, fileLines)) {
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
        if (GlobalFilter.getInstance().includedIn(line)) {
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

/**
 * Parameters for moving a task to a different file or section.
 */
export interface MoveTaskParams {
    /** The task to move */
    originalTask: Task;
    /** The target file to move the task to */
    targetFile: TFile;
    /** The section header to move the task under. If null, moves to end of file or section with no heading. */
    targetSectionHeader: string | null;
    /** If true, append to the end of the file regardless of section header */
    appendToEnd?: boolean;
    /** The vault instance */
    vault: Vault;
    /** The metadata cache instance */
    metadataCache: MetadataCache;
}

/**
 * Moves a task from its current location to a different file and/or section.
 *
 * The task is inserted after the last task in the target section, or at the end
 * of the file if appendToEnd is true or the target section has no tasks.
 *
 * @param params - The parameters for moving the task
 * @throws Error if the operation fails
 */
export async function moveTaskToSection(params: MoveTaskParams): Promise<void> {
    const { originalTask, targetFile, targetSectionHeader, appendToEnd = false, vault, metadataCache } = params;

    const logger = getFileLogger();
    logger.debug(
        `moveTaskToSection: Moving task to ${targetFile.path}, section: ${targetSectionHeader ?? '(end of file)'}`,
    );

    // Get the task line to insert
    const taskLine = originalTask.toFileLineString();

    // Read target file
    const targetContent = await vault.read(targetFile);
    const targetLines = targetContent.split('\n');

    // Get file cache for target file
    const targetCache = metadataCache.getFileCache(targetFile);

    // Find insertion point
    const insertionLine = findInsertionPoint(targetLines, targetCache, targetSectionHeader, appendToEnd);

    logger.debug(`moveTaskToSection: Inserting at line ${insertionLine}`);

    // Insert the task at the target location
    const newTargetLines = [...targetLines.slice(0, insertionLine), taskLine, ...targetLines.slice(insertionLine)];

    // Write the modified target file
    await vault.modify(targetFile, newTargetLines.join('\n'));

    // Now delete the original task from the source file
    // We need to handle the case where source and target are the same file
    const sourceFile = vault.getAbstractFileByPath(originalTask.path);
    if (!(sourceFile instanceof TFile)) {
        throw new Error(`Source file not found: ${originalTask.path}`);
    }

    if (sourceFile.path === targetFile.path) {
        // Same file - we need to re-read and adjust for the insertion we just made
        const updatedContent = await vault.read(sourceFile);
        const updatedLines = updatedContent.split('\n');

        // Find the original task line (it may have shifted due to insertion)
        const originalLineNumber = originalTask.lineNumber;
        const adjustedLineNumber = insertionLine <= originalLineNumber ? originalLineNumber + 1 : originalLineNumber;

        // Verify the line matches
        if (updatedLines[adjustedLineNumber] === originalTask.originalMarkdown) {
            const finalLines = [
                ...updatedLines.slice(0, adjustedLineNumber),
                ...updatedLines.slice(adjustedLineNumber + 1),
            ];
            await vault.modify(sourceFile, finalLines.join('\n'));
        } else {
            // Try to find the line by content
            const foundIndex = updatedLines.findIndex((line) => line === originalTask.originalMarkdown);
            if (foundIndex !== -1) {
                const finalLines = [...updatedLines.slice(0, foundIndex), ...updatedLines.slice(foundIndex + 1)];
                await vault.modify(sourceFile, finalLines.join('\n'));
            } else {
                logger.debug('moveTaskToSection: Could not find original task line to delete after same-file move');
                // The task was moved but we couldn't clean up the original - this is a partial success
                throw new Error('Task was copied but original could not be deleted. Please delete manually.');
            }
        }
    } else {
        // Different file - use the standard replacement mechanism with empty array to delete
        await replaceTaskWithTasks({
            originalTask,
            newTasks: [],
        });
    }

    logger.debug('moveTaskToSection: Move completed successfully');
}

/**
 * Finds the line number where a task should be inserted in a file.
 *
 * @param fileLines - The lines of the target file
 * @param fileCache - The cached metadata for the target file
 * @param targetSectionHeader - The section header to insert under (null for end of file or no-heading section)
 * @param appendToEnd - If true, always append to end of file
 * @returns The line number to insert at
 */
function findInsertionPoint(
    fileLines: string[],
    fileCache: CachedMetadata | null,
    targetSectionHeader: string | null,
    appendToEnd: boolean,
): number {
    // If appendToEnd is true, always append to end of file
    if (appendToEnd) {
        return fileLines.length;
    }

    const headings = fileCache?.headings ?? [];
    const listItems = fileCache?.listItems ?? [];

    // If no target section header specified, find tasks with no heading
    if (targetSectionHeader === null) {
        // Find tasks that are before the first heading or have no heading
        const firstHeadingLine = headings.length > 0 ? headings[0].position.start.line : Infinity;

        // Find the last list item before the first heading
        let lastTaskLine = -1;
        for (const listItem of listItems) {
            if (listItem.task !== undefined && listItem.position.start.line < firstHeadingLine) {
                lastTaskLine = Math.max(lastTaskLine, listItem.position.start.line);
            }
        }

        if (lastTaskLine >= 0) {
            // Insert after the last task in the no-heading section
            return lastTaskLine + 1;
        }

        // No tasks before first heading, insert at end of file
        return fileLines.length;
    }

    // Find the target heading
    const targetHeadingIndex = headings.findIndex((h) => h.heading === targetSectionHeader);
    if (targetHeadingIndex === -1) {
        // Target heading not found, append to end
        return fileLines.length;
    }

    const targetHeading = headings[targetHeadingIndex];
    const targetHeadingLine = targetHeading.position.start.line;

    // Find the line number of the next heading (or end of file)
    const nextHeadingLine =
        targetHeadingIndex < headings.length - 1
            ? headings[targetHeadingIndex + 1].position.start.line
            : fileLines.length;

    // Find the last task in this section
    let lastTaskLineInSection = -1;
    for (const listItem of listItems) {
        const itemLine = listItem.position.start.line;
        if (listItem.task !== undefined && itemLine > targetHeadingLine && itemLine < nextHeadingLine) {
            lastTaskLineInSection = Math.max(lastTaskLineInSection, itemLine);
        }
    }

    if (lastTaskLineInSection >= 0) {
        // Insert after the last task in the section
        return lastTaskLineInSection + 1;
    }

    // No tasks in the section, insert right after the heading
    return targetHeadingLine + 1;
}
