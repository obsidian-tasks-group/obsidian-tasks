function endsWith1Slash(inputLine: string) {
    return inputLine.endsWith('\\');
}

function stripLeadingWhitespace(adjustedInputLine: string) {
    return adjustedInputLine.replace(/^[ \t]*/, '');
}

function stripEndingSlashAndPrecedingWhitespace(adjustedInputLine: string) {
    return adjustedInputLine.replace(/[ \t]*\\$/, '');
}

/**
 * Removes newlines escaped by a backslash.
 * A trailing backslash at the end of a line can be escaped by doubling it.
 *
 * @param input input string
 * @returns modified input
 */
export function continue_lines(input: string): string {
    const outputLines: string[] = [];
    let joinToNext = false;
    for (const inputLine of input.split('\n')) {
        // Adjust the line:
        let adjustedLine = inputLine;
        if (joinToNext) {
            adjustedLine = stripLeadingWhitespace(inputLine);
        }
        if (endsWith1Slash(inputLine)) {
            adjustedLine = stripEndingSlashAndPrecedingWhitespace(adjustedLine);
        }

        // Save this line:
        if (joinToNext) {
            outputLines[outputLines.length - 1] += ' ' + adjustedLine;
        } else {
            outputLines.push(adjustedLine);
        }

        // Decide what to do with the next line:
        joinToNext = endsWith1Slash(inputLine);
    }
    return outputLines.join('\n');
}

/**
 * Take an input string and split it into a list of statements.
 *
 * Generally this is similar to splitting the string into lines, but handles line
 * continuations and escape sequences.
 *
 * @param input Input string
 * @returns List of statements
 */
export function scan(input: string): string[] {
    return continue_lines(input)
        .split('\n')
        .map((rawLine: string) => rawLine.trim())
        .filter((line) => line !== '');
}
