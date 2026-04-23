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
 * Finds the last line of all descendants of a given list item.
 * Uses the `parent` field in ListItemCache to find children.
 * Returns the item's own line if it has no children.
 *
 * @param listItems - All list items in the file
 * @param itemLine - The line number of the item to find descendants for
 * @returns The last line number occupied by the item or any of its descendants
 */
function findLastDescendantLine(listItems: ListItemCache[], itemLine: number): number {
    let lastLine = itemLine;

    // Find all descendants by checking which items have this line (or a descendant) as their parent.
    // The parent field contains the line number of the parent item, or a negative value if no parent.
    const descendantLines = new Set<number>([itemLine]);
    let foundNew = true;

    while (foundNew) {
        foundNew = false;
        for (const item of listItems) {
            const line = item.position.start.line;
            if (item.parent >= 0 && descendantLines.has(item.parent) && !descendantLines.has(line)) {
                descendantLines.add(line);
                lastLine = Math.max(lastLine, line);
                foundNew = true;
            }
        }
    }

    return lastLine;
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
        // Find the last descendant of this task to avoid splitting it from its nested children
        const lastDescendantLine = findLastDescendantLine(listItems, lastTaskLineInSection);
        return lastDescendantLine + 1;
    }

    return targetHeadingLine + 1;
}
