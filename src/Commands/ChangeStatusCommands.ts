import { type Command } from 'obsidian';
import type { StatusRegistry } from 'Statuses/StatusRegistry';
import { allStatusInstructions } from 'ui/EditInstructions/StatusInstructions';
import { applyInstructionToLine, createMultiLineEditorCallback } from 'Commands/CreateEditorCallback';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';

const notATaskMessage = 'Cannot set status: line is not a task or does not match global filter';

/**
 * Creates an editor callback that applies a TaskEditingInstruction to the task on the cursor's line,
 * or, when the selections cover several lines, of every task on those lines.
 *
 * Lines in a multi-line selection that are not tasks are left unchanged.
 *
 * @param instruction - The instruction to edit the task
 */
export const createApplyInstructionEditorCallback = (instruction: TaskEditingInstruction) => {
    return createMultiLineEditorCallback(
        (line: string, path: string) => applyInstructionToLine(line, path, instruction),
        notATaskMessage,
    );
};

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
            editorCheckCallback: createApplyInstructionEditorCallback(instruction),
        };
        setStatusCommands.push(command);
    }
    return setStatusCommands;
}
