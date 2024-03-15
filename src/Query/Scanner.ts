import { Statement } from './Statement';

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

/**
 * Removes newlines escaped by a backslash.
 * A trailing backslash at the end of a line can be escaped by doubling it.
 *
 * @param input input string
 * @returns modified input, as a string
 *
 * @see continueLines
 */
export function continueLinesFlattened(input: string): string {
    return continueLines(input)
        .map((instruction) => instruction.anyContinuationLinesRemoved)
        .join('\n');
}

/**
 * Removes newlines escaped by a backslash.
 * A trailing backslash at the end of a line can be escaped by doubling it.
 *
 * Instruction lines are not trimmed.
 * But instructions that are empty or only contain whitespace are discarded.
 *
 * @param input input string
 * @returns modified input, as a list of strings
 *
 * @see continueLinesFlattened
 */
export function continueLines(input: string): Statement[] {
    const instructions: Statement[] = [];
    let continuePreviousLine = false;

    let currentStatementRaw = '';
    let currentStatementProcessed = '';
    for (const inputLine of input.split('\n')) {
        const adjustedLine = adjustLine(inputLine, continuePreviousLine);
        if (continuePreviousLine) {
            currentStatementRaw += '\n' + inputLine;
            currentStatementProcessed += ' ' + adjustedLine;
        } else {
            currentStatementRaw = inputLine;
            currentStatementProcessed = adjustedLine;
        }

        // Decide what to do with the next line:
        if (endsWith2Slashes(inputLine)) {
            continuePreviousLine = false;
        } else {
            continuePreviousLine = endsWith1Slash(inputLine);
        }
        if (!continuePreviousLine) {
            if (currentStatementProcessed.trim() !== '') {
                instructions.push(new Statement(currentStatementRaw, currentStatementProcessed));
            }
            currentStatementRaw = '';
            currentStatementProcessed = '';
        }
    }
    return instructions;
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
    return continueLines(input).map((instruction: Statement) => instruction.anyContinuationLinesRemoved);
}
