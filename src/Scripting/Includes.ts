import type { IncludesMap } from '../Config/Settings';

function summariseInstruction(instructions: string) {
    let result = instructions;
    let truncated = false;

    // Only return the first line of any multi-line instructions:
    const splitInstructions = instructions.split('\n');
    if (splitInstructions.length > 1) {
        result = splitInstructions[0];
        truncated = true;
    }

    // Shorten longer lines, since text is wrapped in error output.
    const maxLineLength = 50;
    if (result.length > maxLineLength) {
        result = result.slice(0, maxLineLength);
        truncated = true;
    }

    if (truncated) {
        result += '...';
    }
    return result;
}

export function unknownIncludeErrorMessage(includeName: string, includes: IncludesMap) {
    let message = `Cannot find include "${includeName}" in the Tasks settings`;

    const isIncludesEmpty = Object.keys(includes).length === 0;
    if (isIncludesEmpty) {
        message += `\nYou can define the instruction(s) for "${includeName}" in the Tasks settings.`;
    } else {
        const maxKeyLength = Math.max(...Object.keys(includes).map((key) => key.length));
        const availableNames = Object.entries(includes)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => `${key.padEnd(maxKeyLength)}: ${summariseInstruction(value)}`)
            .join('\n  ');
        message += `\nThe following includes are defined in the Tasks settings:\n  ${availableNames}`;
    }

    return message;
}
