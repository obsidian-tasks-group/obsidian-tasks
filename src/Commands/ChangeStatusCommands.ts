import { type Command } from 'obsidian';
import type { StatusRegistry } from 'Statuses/StatusRegistry';
import { allStatusInstructions } from 'ui/EditInstructions/StatusInstructions';
import { createApplyInstructionEditorCallback } from 'Commands/CreateEditorCallback';

const notATaskMessage = 'Cannot set status: line is not a task or does not match global filter';

/**
 * Create set-status commands for each registered status
 * @param statusRegistry
 */
export function createSetStatusCommands(statusRegistry: StatusRegistry): Command[] {
    const statusInstructions = allStatusInstructions(statusRegistry);
    const setStatusCommands: Command[] = [];
    for (const instruction of statusInstructions) {
        const status = instruction.newStatus;
        // We want the command id to not change if a user renames the status.
        // And we also don't want to have to figure out how to handle duplicate status names.
        // So we use the single-character status symbol in the command id, avoiding using a space character.
        const symbolSlug = status.symbol === ' ' ? 'space' : status.symbol;

        const command = {
            id: `set-status-symbol-to-${symbolSlug}`,
            name: instruction.instructionDisplayName(),
            editorCheckCallback: createApplyInstructionEditorCallback(instruction, notATaskMessage),
        };
        setStatusCommands.push(command);
    }
    return setStatusCommands;
}
