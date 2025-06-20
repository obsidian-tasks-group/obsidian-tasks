export type PresetsMap = Record<string, string>;
export const defaultPresets = {
    this_file: 'path includes {{query.file.path}}',
    this_folder: 'folder includes {{query.file.folder}}',
    this_folder_only: 'filter by function task.file.folder === query.file.folder',
    this_root: 'root includes {{query.file.root}}',
    hide_date_fields:
        '# Hide any values for all date fields\nhide due date\nhide scheduled date\nhide start date\nhide created date\nhide done date\nhide cancelled date',
    hide_non_date_fields:
        '# Hide all the non-date fields, but not tags\nhide id\nhide depends on\nhide recurrence rule\nhide on completion\nhide priority',
    hide_query_elements: '# Hide postpone, edit and backinks\nhide postpone button\nhide edit button\nhide backlinks',
    hide_everything:
        '# Hide everything except description and any tags\npreset hide_date_fields\npreset hide_non_date_fields\npreset hide_query_elements',
};

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
