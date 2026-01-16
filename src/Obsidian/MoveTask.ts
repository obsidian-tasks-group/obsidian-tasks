import { MetadataCache, TFile, Vault } from 'obsidian';
import type { Task } from '../Task/Task';
import { logging } from '../lib/logging';
import { findInsertionPoint } from './FindInsertionPoint';
import { getTaskWithChildren } from './FindTaskWithChildren';
import { findTaskLineWithFallbacks } from './FindTaskLine';

function getFileLogger() {
    // For logging to actually produce debug output when enabled in settings,
    // it appears that the logger cannot be created until execution time.
    return logging.getLogger('tasks.MoveTask');
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
    /** Optional: the current cursor line in the editor (for more reliable deletion when moving from editor) */
    editorCursorLine?: number;
}

/**
 * Moves a task from its current location to a different file and/or section.
 * Also moves any child items (indented lines below the task).
 *
 * The task is inserted after the last task in the target section, or at the end
 * of the file if appendToEnd is true or the target section has no tasks.
 *
 * @param params - The parameters for moving the task
 * @throws Error if the operation fails
 */
export async function moveTaskToSection(params: MoveTaskParams): Promise<void> {
    const {
        originalTask,
        targetFile,
        targetSectionHeader,
        appendToEnd = false,
        vault,
        metadataCache,
        editorCursorLine,
    } = params;

    const logger = getFileLogger();
    logger.debug(
        `moveTaskToSection: Moving task to ${targetFile.path}, section: ${targetSectionHeader ?? '(end of file)'}`,
    );

    // Get the source file
    const sourceFile = vault.getAbstractFileByPath(originalTask.path);
    if (!(sourceFile instanceof TFile)) {
        throw new TypeError(`Source file not found: ${originalTask.path}`);
    }

    // Read source file to find the task and its children
    const sourceContent = await vault.read(sourceFile);
    const sourceLines = sourceContent.split('\n');

    // Find the task line in the source file using multiple strategies
    const taskLineIndex = findTaskLineWithFallbacks(sourceLines, originalTask, editorCursorLine);

    if (taskLineIndex === -1) {
        throw new Error('Could not find the task in the source file.');
    }

    // Find all lines to move (task + children)
    const linesToMove = getTaskWithChildren(sourceLines, taskLineIndex);
    const numLinesToMove = linesToMove.length;

    logger.debug(`moveTaskToSection: Moving ${numLinesToMove} lines (task + ${numLinesToMove - 1} children)`);

    // Read target file
    const targetContent = await vault.read(targetFile);
    const targetLines = targetContent.split('\n');

    // Get file cache for target file
    const targetCache = metadataCache.getFileCache(targetFile);

    // Find insertion point
    const insertionLine = findInsertionPoint(targetLines, targetCache, targetSectionHeader, appendToEnd);

    logger.debug(`moveTaskToSection: Inserting at line ${insertionLine}`);

    // Handle the move based on whether source and target are the same file
    if (sourceFile.path === targetFile.path) {
        await moveTaskWithinSameFile(vault, sourceFile, sourceLines, taskLineIndex, insertionLine, linesToMove);
    } else {
        await moveTaskBetweenFiles(
            vault,
            sourceFile,
            targetFile,
            sourceLines,
            targetLines,
            taskLineIndex,
            insertionLine,
            linesToMove,
        );
    }

    logger.debug('moveTaskToSection: Move completed successfully');
}

/**
 * Moves a task within the same file atomically.
 */
async function moveTaskWithinSameFile(
    vault: Vault,
    file: TFile,
    sourceLines: string[],
    taskLineIndex: number,
    insertionLine: number,
    linesToMove: string[],
): Promise<void> {
    const numLinesToMove = linesToMove.length;
    let newLines: string[];

    if (insertionLine <= taskLineIndex) {
        // Inserting before the task - insert first, then delete (accounting for offset)
        newLines = [
            ...sourceLines.slice(0, insertionLine),
            ...linesToMove,
            ...sourceLines.slice(insertionLine, taskLineIndex),
            ...sourceLines.slice(taskLineIndex + numLinesToMove),
        ];
    } else {
        // Inserting after the task - the slicing handles the offset naturally
        newLines = [
            ...sourceLines.slice(0, taskLineIndex),
            ...sourceLines.slice(taskLineIndex + numLinesToMove, insertionLine),
            ...linesToMove,
            ...sourceLines.slice(insertionLine),
        ];
    }

    await vault.modify(file, newLines.join('\n'));
}

/**
 * Moves a task between two different files.
 */
async function moveTaskBetweenFiles(
    vault: Vault,
    sourceFile: TFile,
    targetFile: TFile,
    sourceLines: string[],
    targetLines: string[],
    taskLineIndex: number,
    insertionLine: number,
    linesToMove: string[],
): Promise<void> {
    const numLinesToMove = linesToMove.length;

    // Insert into target first
    const newTargetLines = [
        ...targetLines.slice(0, insertionLine),
        ...linesToMove,
        ...targetLines.slice(insertionLine),
    ];
    await vault.modify(targetFile, newTargetLines.join('\n'));

    // Delete from source
    const newSourceLines = [
        ...sourceLines.slice(0, taskLineIndex),
        ...sourceLines.slice(taskLineIndex + numLinesToMove),
    ];
    await vault.modify(sourceFile, newSourceLines.join('\n'));
}
