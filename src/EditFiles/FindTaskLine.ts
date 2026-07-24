import type { Task } from '../Task/Task';

/**
 * Finds the task line index using multiple fallback strategies.
 */
export function findTaskLineWithFallbacks(
    sourceLines: string[],
    originalTask: Task,
    editorCursorLine?: number,
): number {
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
    for (let i = 0; i < sourceLines.length; i++) {
        const line = sourceLines[i];
        if (line.includes('- [') && line.includes(description)) {
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
            return editorCursorLine;
        }
    }
    return -1;
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
    // Strategy 1: If we have editor cursor position and it matches, use it
    if (editorCursorLine !== undefined && editorCursorLine >= 0 && editorCursorLine < lines.length) {
        if (lines[editorCursorLine] === taskMarkdown) {
            return editorCursorLine;
        }
    }

    // Strategy 2: Try the task's line number
    if (taskLineNumber >= 0 && taskLineNumber < lines.length) {
        if (lines[taskLineNumber] === taskMarkdown) {
            return taskLineNumber;
        }
    }

    // Strategy 3: Search by content
    const matchingIndices: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === taskMarkdown) {
            matchingIndices.push(i);
        }
    }

    if (matchingIndices.length === 1) {
        return matchingIndices[0];
    } else if (matchingIndices.length > 1) {
        // Multiple matches - prefer the one closest to the expected line number
        const expectedLine = editorCursorLine ?? taskLineNumber;
        return matchingIndices.reduce((closest, current) => {
            const closestDiff = Math.abs(closest - expectedLine);
            const currentDiff = Math.abs(current - expectedLine);
            return currentDiff < closestDiff ? current : closest;
        }, matchingIndices[0]);
    }

    return -1;
}
