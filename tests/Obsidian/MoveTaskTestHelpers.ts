/**
 * Helper for testing move task functionality.
 *
 * This replicates the findInsertionPoint logic from File.ts for testing purposes,
 * since the original function is internal and works with Obsidian's CachedMetadata.
 */

interface MockHeading {
    heading: string;
    position: { start: { line: number } };
}

interface MockListItem {
    task?: string;
    position: { start: { line: number } };
}

interface MockCachedMetadata {
    headings?: MockHeading[];
    listItems?: MockListItem[];
}

/**
 * Finds the last task line before a given line number.
 */
function findLastTaskLineBefore(listItems: MockListItem[], beforeLine: number): number {
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
function findLastTaskLineInRange(listItems: MockListItem[], startLine: number, endLine: number): number {
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
    headings: MockHeading[],
    listItems: MockListItem[],
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
 * This is a test-friendly version of the function in File.ts.
 *
 * @param fileLines - The lines of the target file
 * @param fileCache - Mock cached metadata for the target file
 * @param targetSectionHeader - The section header to insert under (null for end of file or no-heading section)
 * @param appendToEnd - If true, always append to end of file
 * @returns The line number to insert at
 */
export function findInsertionPointForTesting(
    fileLines: string[],
    fileCache: MockCachedMetadata | null,
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
