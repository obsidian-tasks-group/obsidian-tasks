import type { CachedMetadata } from 'obsidian';
import type { Task } from '../Task/Task';
import type { Logger } from '../lib/logging';
import { findTaskLineWithFallbacks } from '../Obsidian/FindTaskLine';
import { getTaskWithChildren } from '../Obsidian/FindTaskWithChildren';
import { findInsertionPoint } from '../Obsidian/FindInsertionPoint';

export function moveTask(
    sourceLines: string[],
    originalTask: Task,
    editorCursorLine: number | undefined,
    logger: Logger,
    targetLines: string[],
    targetCache: CachedMetadata | null,
    targetSectionHeader: string | null,
    appendToEnd: boolean,
): { taskLineIndex: number; linesToMove: string[]; insertionLine: number } {
    // Find the task line in the source file using multiple strategies
    const taskLineIndex = findTaskLineWithFallbacks(sourceLines, originalTask, editorCursorLine);

    if (taskLineIndex === -1) {
        throw new Error('Could not find the task in the source file.');
    }

    // Find all lines to move (task + children)
    const linesToMove = getTaskWithChildren(sourceLines, taskLineIndex);
    const numLinesToMove = linesToMove.length;

    logger.debug(`moveTaskToSection: Moving ${numLinesToMove} lines (task + ${numLinesToMove - 1} children)`);

    // Find insertion point
    const insertionLine = findInsertionPoint(targetLines, targetCache, targetSectionHeader, appendToEnd);

    logger.debug(`moveTaskToSection: Inserting at line ${insertionLine}`);
    return {
        taskLineIndex,
        linesToMove,
        insertionLine,
    };
}

export function moveTaskWithinSameFile(
    sourceLines: string[],
    taskLineIndex: number,
    insertionLine: number,
    linesToMove: string[],
): string[] {
    const numLinesToMove = linesToMove.length;

    if (insertionLine <= taskLineIndex) {
        // Inserting before the task - insert first, then delete (accounting for offset)
        return [
            ...sourceLines.slice(0, insertionLine),
            ...linesToMove,
            ...sourceLines.slice(insertionLine, taskLineIndex),
            ...sourceLines.slice(taskLineIndex + numLinesToMove),
        ];
    } else {
        // Inserting after the task - the slicing handles the offset naturally
        return [
            ...sourceLines.slice(0, taskLineIndex),
            ...sourceLines.slice(taskLineIndex + numLinesToMove, insertionLine),
            ...linesToMove,
            ...sourceLines.slice(insertionLine),
        ];
    }
}

export function moveTaskBetweenFiles(
    sourceLines: string[],
    targetLines: string[],
    taskLineIndex: number,
    insertionLine: number,
    linesToMove: string[],
): { newTargetLines: string[]; newSourceLines: string[] } {
    const numLinesToMove = linesToMove.length;

    // Insert into target first
    const newTargetLines = [
        ...targetLines.slice(0, insertionLine),
        ...linesToMove,
        ...targetLines.slice(insertionLine),
    ];

    // Delete from source
    const newSourceLines = [
        ...sourceLines.slice(0, taskLineIndex),
        ...sourceLines.slice(taskLineIndex + numLinesToMove),
    ];
    return { newTargetLines, newSourceLines };
}
