import type { CachedMetadata, ListItemCache } from 'obsidian';

/**
 * Finds the last task line before a given line number.
 */
function findLastTaskLineBefore(listItems: ListItemCache[], beforeLine: number): number {
    let lastTaskLine = -1;
    for (const listItem of listItems) {
        if (listItem.task !== undefined && listItem.position.start.line < beforeLine) {
            lastTaskLine = Math.max(lastTaskLine, listItem.position.start.line);
        }
    }
    return lastTaskLine;
}

/**
 * Finds the last task line within a range.
 */
function findLastTaskLineInRange(listItems: ListItemCache[], startLine: number, endLine: number): number {
    let lastTaskLine = -1;
    for (const listItem of listItems) {
        const itemLine = listItem.position.start.line;
        if (listItem.task !== undefined && itemLine > startLine && itemLine < endLine) {
            lastTaskLine = Math.max(lastTaskLine, itemLine);
        }
    }
    return lastTaskLine;
}

/**
 * Finds the insertion point for tasks with no heading.
 */
function findInsertionPointNoHeading(
    fileLines: string[],
    headings: { position: { start: { line: number } } }[],
    listItems: ListItemCache[],
): number {
    const firstHeadingLine = headings.length > 0 ? headings[0].position.start.line : Infinity;
    const lastTaskLine = findLastTaskLineBefore(listItems, firstHeadingLine);

    if (lastTaskLine >= 0) {
        return lastTaskLine + 1;
    }
    return fileLines.length;
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
export function findInsertionPoint(
    fileLines: string[],
    fileCache: CachedMetadata | null,
    targetSectionHeader: string | null,
    appendToEnd: boolean,
): number {
    if (appendToEnd) {
        return fileLines.length;
    }

    const headings = fileCache?.headings ?? [];
    const listItems = fileCache?.listItems ?? [];

    // If no target section header specified, find tasks with no heading
    if (targetSectionHeader === null) {
        return findInsertionPointNoHeading(fileLines, headings, listItems);
    }

    // Find the target heading
    const targetHeadingIndex = headings.findIndex((h) => h.heading === targetSectionHeader);
    if (targetHeadingIndex === -1) {
        return fileLines.length;
    }

    const targetHeadingLine = headings[targetHeadingIndex].position.start.line;
    const nextHeadingLine =
        targetHeadingIndex < headings.length - 1
            ? headings[targetHeadingIndex + 1].position.start.line
            : fileLines.length;

    const lastTaskLineInSection = findLastTaskLineInRange(listItems, targetHeadingLine, nextHeadingLine);

    if (lastTaskLineInSection >= 0) {
        return lastTaskLineInSection + 1;
    }

    return targetHeadingLine + 1;
}
