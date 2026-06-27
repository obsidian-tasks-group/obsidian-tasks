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

export function getTaskWithChildren(lines: string[], taskLineIndex: number): string[] {
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
