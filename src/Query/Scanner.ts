function endsWith1Slash(inputLine: string) {
    return inputLine.endsWith('\\');
}

function endsWith2Slashes(inputLine: string) {
    return inputLine.endsWith('\\\\');
}

function stripLeadingWhitespace(adjustedInputLine: string) {
    return adjustedInputLine.replace(/^[ \t]*/, '');
}

function stripEndingSlashAndPrecedingWhitespace(adjustedInputLine: string) {
    return adjustedInputLine.replace(/[ \t]*\\$/, '');
}

function adjustLine(inputLine: string, continuePreviousLine: boolean) {
    let adjustedLine = inputLine;
    if (continuePreviousLine) {
        // The new line will be appended to the previous one,
        // so discard any leading white space:
        adjustedLine = stripLeadingWhitespace(inputLine);
    }

    if (endsWith2Slashes(adjustedLine)) {
        // This has at least 2 backslashes at the end of the line,
        // so convert '\\' to '\':
        adjustedLine = adjustedLine.slice(0, -1);
    } else if (endsWith1Slash(inputLine)) {
        // This is a continuation line, so remove its trailing backslash
        // and any spare white space beforehand.
        adjustedLine = stripEndingSlashAndPrecedingWhitespace(adjustedLine);
    }
    return adjustedLine;
}

function saveLine(outputLines: string[], continuePreviousLine: boolean, adjustedLine: string) {
    if (continuePreviousLine) {
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
    let continuePreviousLine = false;
    for (const inputLine of input.split('\n')) {
        const adjustedLine = adjustLine(inputLine, continuePreviousLine);
        saveLine(outputLines, continuePreviousLine, adjustedLine);

        // Decide what to do with the next line:
        if (endsWith2Slashes(inputLine)) {
            continuePreviousLine = false;
        } else {
            continuePreviousLine = endsWith1Slash(inputLine);
        }
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
