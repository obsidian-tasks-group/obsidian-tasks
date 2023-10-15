function endsWith1Slash(inputLine: string) {
    return inputLine.endsWith('\\');
}

function stripLeadingWhitespace(adjustedInputLine: string) {
    return adjustedInputLine.replace(/^[ \t]*/, '');
}

function stripEndingSlashAndPrecedingWhitespace(adjustedInputLine: string) {
    return adjustedInputLine.replace(/[ \t]*\\$/, '');
}

function adjustLine(inputLine: string, joinToNext: boolean) {
    let adjustedLine = inputLine;
    if (joinToNext) {
        // The new line will be appended to the previous one,
        // so discard any leading white space:
        adjustedLine = stripLeadingWhitespace(inputLine);
    }
    if (endsWith1Slash(inputLine)) {
        // This is a continuation line, so remove its trailing backslash
        // and any spare white space beforehand.
        adjustedLine = stripEndingSlashAndPrecedingWhitespace(adjustedLine);
    }
    return adjustedLine;
}

function saveLine(outputLines: string[], joinToNext: boolean, adjustedLine: string) {
    if (joinToNext) {
        outputLines[outputLines.length - 1] += ' ' + adjustedLine;
    } else {
        outputLines.push(adjustedLine);
    }
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
        const adjustedLine = adjustLine(inputLine, joinToNext);
        saveLine(outputLines, joinToNext, adjustedLine);

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
