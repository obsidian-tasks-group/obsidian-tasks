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
    return allStatusInstructions(statusRegistry).map((instruction) => ({
        id: instruction.commandId(),
        name: instruction.instructionDisplayName(),
        editorCheckCallback: createApplyInstructionEditorCallback(instruction, notATaskMessage),
    }));
}
