import { type Command } from 'obsidian';
import { ALL_DATE_FIELDS, type AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { createApplyInstructionEditorCallback } from 'Commands/CreateEditorCallback';
import { RemoveTaskDate } from 'ui/EditInstructions/DateInstructions';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';
import { dateFieldCommandNameText } from 'ui/EditInstructions/DateCommandNames';

const notATaskMessage = 'Cannot change date: line is not a task or does not match global filter';

/**
 * Return the instructions for the date commands for one date field.
 */
function dateCommandInstructions(field: AllTaskDateFields): TaskEditingInstruction[] {
    return [new RemoveTaskDate(field, `Remove ${dateFieldCommandNameText(field)}`)];
}

/**
 * Create commands to edit one date field, on every selected task.
 */
export function createChangeDateCommandsForField(field: AllTaskDateFields): Command[] {
    return dateCommandInstructions(field).map((instruction) => ({
        id: instruction.commandId(),
        name: instruction.instructionDisplayName(),
        editorCheckCallback: createApplyInstructionEditorCallback(instruction, notATaskMessage),
    }));
}

/**
 * Create commands to change, add, move or remove each date field, on every selected task.
 */
export function createChangeDateCommands(): Command[] {
    return ALL_DATE_FIELDS.flatMap(createChangeDateCommandsForField);
}
