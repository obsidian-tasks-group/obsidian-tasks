export type PresetsMap = Record<string, string>;

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

export function unknownPresetErrorMessage(presentName: string, presets: PresetsMap) {
    let message = `Cannot find preset "${presentName}" in the Tasks settings`;

    const isPresetsEmpty = Object.keys(presets).length === 0;
    if (isPresetsEmpty) {
        message += `\nYou can define the instruction(s) for "${presentName}" in the Tasks settings.`;
    } else {
        const maxKeyLength = Math.max(...Object.keys(presets).map((key) => key.length));
        const availableNames = Object.entries(presets)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => `${key.padEnd(maxKeyLength)}: ${summariseInstruction(value)}`)
            .join('\n  ');
        message += `\nThe following presets are defined in the Tasks settings:\n  ${availableNames}`;
    }

    return message;
}
