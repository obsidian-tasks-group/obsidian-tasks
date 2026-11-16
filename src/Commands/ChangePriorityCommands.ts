import { type Command } from 'obsidian';
import { allPriorityInstructions } from 'ui/EditInstructions/PriorityInstructions';
import { createApplyInstructionEditorCallback } from 'Commands/CreateEditorCallback';

const notATaskMessage = 'Cannot set priority: line is not a task or does not match global filter';

/**
 * Create set-priority commands
 */
export function createSetPriorityCommands(): Command[] {
    return allPriorityInstructions().map((instruction) => ({
        id: instruction.commandId(),
        name: instruction.instructionDisplayName(),
        editorCheckCallback: createApplyInstructionEditorCallback(instruction, notATaskMessage),
    }));
}
