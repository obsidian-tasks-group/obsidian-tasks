import type { IncludesMap } from '../Config/Settings';

function summariseInstruction(instructions: string) {
    // Only return the first line of any multi-line instructions:
    const splitInstructions = instructions.split('\n');
    if (splitInstructions.length > 1) {
        return `${splitInstructions[0]}...`;
    }

    return instructions;
}

export function unknownIncludeErrorMessage(includeName: string, includes: IncludesMap) {
    let message = `Cannot find include "${includeName}" in the Tasks settings`;

    const isIncludesEmpty = Object.keys(includes).length === 0;
    if (isIncludesEmpty) {
        message += `\nYou can define the instruction(s) for "${includeName}" in the Tasks settings.`;
    } else {
        const availableNames = Object.entries(includes)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => `${key}: ${summariseInstruction(value)}`)
            .join('\n  ');
        message += `\nThe following includes are defined in the Tasks settings:\n  ${availableNames}`;
    }

    return message;
}
