import { MetadataCache, TFile, Vault } from 'obsidian';
import type { Task } from '../Task/Task';
import { logging } from '../lib/logging';
import { findInsertionPoint } from './FindInsertionPoint';

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
 * Finds the task line index using multiple fallback strategies.
 */
function findTaskLineWithFallbacks(sourceLines: string[], originalTask: Task, editorCursorLine?: number): number {
    // Try originalMarkdown first
    let taskLineIndex = findTaskLineIndex(
        sourceLines,
        originalTask.originalMarkdown,
        originalTask.lineNumber,
        editorCursorLine,
    );

    // Try with toFileLineString() as fallback
    if (taskLineIndex === -1) {
        const fileLineString = originalTask.toFileLineString();
        console.log('[Tasks Move] originalMarkdown not found, trying toFileLineString:', fileLineString);
        taskLineIndex = findTaskLineIndex(sourceLines, fileLineString, originalTask.lineNumber, editorCursorLine);
    }

    // Try flexible search by description
    if (taskLineIndex === -1) {
        taskLineIndex = findTaskByFlexibleSearch(sourceLines, originalTask.description);
    }

    // Last resort: trust the cursor line
    if (taskLineIndex === -1) {
        taskLineIndex = findTaskByCursorLine(sourceLines, editorCursorLine);
    }

    return taskLineIndex;
}

/**
 * Finds a task line by flexible search using the task description.
 */
function findTaskByFlexibleSearch(sourceLines: string[], description: string): number {
    console.log('[Tasks Move] Still not found, trying flexible search with description:', description);
    for (let i = 0; i < sourceLines.length; i++) {
        const line = sourceLines[i];
        if (line.includes('- [') && line.includes(description)) {
            console.log('[Tasks Move] Found via flexible search at line', i, ':', line);
            return i;
        }
    }
    return -1;
}

/**
 * Finds a task line by trusting the editor cursor position as last resort.
 */
function findTaskByCursorLine(sourceLines: string[], editorCursorLine?: number): number {
    if (editorCursorLine !== undefined && editorCursorLine >= 0 && editorCursorLine < sourceLines.length) {
        const cursorLine = sourceLines[editorCursorLine];
        if (cursorLine.includes('- [')) {
            console.log('[Tasks Move] Using cursor line as last resort:', editorCursorLine, cursorLine);
            return editorCursorLine;
        }
    }
    return -1;
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

/**
 * Find the line index of a task in the file.
 * Uses multiple strategies: editor cursor, exact line number, content search.
 */
function findTaskLineIndex(
    lines: string[],
    taskMarkdown: string,
    taskLineNumber: number,
    editorCursorLine?: number,
): number {
    console.log('[Tasks Move] findTaskLineIndex called:', {
        taskMarkdown,
        taskLineNumber,
        editorCursorLine,
        totalLines: lines.length,
    });

    // Strategy 1: If we have editor cursor position and it matches, use it
    if (editorCursorLine !== undefined && editorCursorLine >= 0 && editorCursorLine < lines.length) {
        console.log('[Tasks Move] Trying cursor line:', editorCursorLine, 'Content:', lines[editorCursorLine]);
        if (lines[editorCursorLine] === taskMarkdown) {
            console.log('[Tasks Move] Found at cursor line!');
            return editorCursorLine;
        }
        console.log('[Tasks Move] Cursor line does not match');
    }

    // Strategy 2: Try the task's line number
    if (taskLineNumber >= 0 && taskLineNumber < lines.length) {
        console.log('[Tasks Move] Trying task line number:', taskLineNumber, 'Content:', lines[taskLineNumber]);
        if (lines[taskLineNumber] === taskMarkdown) {
            console.log('[Tasks Move] Found at task line number!');
            return taskLineNumber;
        }
        console.log('[Tasks Move] Task line number does not match');
    }

    // Strategy 3: Search by content
    console.log('[Tasks Move] Searching by content...');
    const matchingIndices: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === taskMarkdown) {
            matchingIndices.push(i);
        }
    }

    console.log('[Tasks Move] Found', matchingIndices.length, 'matching lines:', matchingIndices);

    if (matchingIndices.length === 1) {
        console.log('[Tasks Move] Single match found at line', matchingIndices[0]);
        return matchingIndices[0];
    } else if (matchingIndices.length > 1) {
        // Multiple matches - prefer the one closest to the expected line number
        const expectedLine = editorCursorLine ?? taskLineNumber;
        const result = matchingIndices.reduce((closest, current) => {
            const closestDiff = Math.abs(closest - expectedLine);
            const currentDiff = Math.abs(current - expectedLine);
            return currentDiff < closestDiff ? current : closest;
        }, matchingIndices[0]);
        console.log('[Tasks Move] Multiple matches, picking closest to', expectedLine, ':', result);
        return result;
    }

    // Debug: show what the lines look like around the expected location
    console.log('[Tasks Move] No match found. Expected task markdown:');
    console.log('[Tasks Move] >' + taskMarkdown + '<');
    console.log('[Tasks Move] Lines around expected location:');
    const start = Math.max(0, taskLineNumber - 2);
    const end = Math.min(lines.length, taskLineNumber + 3);
    for (let i = start; i < end; i++) {
        console.log(`[Tasks Move] Line ${i}: >${lines[i]}<`);
    }

    return -1;
}

/**
 * Get the task line and all its children (indented lines below it).
 * Returns an array of lines to move together.
 */
// Regex pattern for matching leading whitespace
const LEADING_WHITESPACE_REGEX = /^(\s*)/;

/**
 * Gets the indentation level (number of leading whitespace characters) of a line.
 */
function getIndentLevel(line: string): number {
    const match = LEADING_WHITESPACE_REGEX.exec(line);
    return match ? match[1].length : 0;
}

/**
 * Checks if there are more child lines after a given empty line index.
 */
function hasMoreChildrenAfterEmptyLine(lines: string[], startIndex: number, taskIndent: number): boolean {
    for (let j = startIndex; j < lines.length; j++) {
        const nextLine = lines[j];
        if (nextLine.trim() === '') continue;
        return getIndentLevel(nextLine) > taskIndent;
    }
    return false;
}

function getTaskWithChildren(lines: string[], taskLineIndex: number): string[] {
    const result: string[] = [lines[taskLineIndex]];
    const taskIndent = getIndentLevel(lines[taskLineIndex]);

    // Collect all following lines that are more indented (children)
    for (let i = taskLineIndex + 1; i < lines.length; i++) {
        const line = lines[i];

        // Handle empty lines: include them if there are more children after
        if (line.trim() === '') {
            if (!hasMoreChildrenAfterEmptyLine(lines, i + 1, taskIndent)) {
                break;
            }
            result.push(line);
            continue;
        }

        const lineIndent = getIndentLevel(line);

        // If this line is more indented than the task, it's a child
        if (lineIndent > taskIndent) {
            result.push(line);
        } else {
            // Less or equal indentation means we've left the children
            break;
        }
    }

    return result;
}
