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
