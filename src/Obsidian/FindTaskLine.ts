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
