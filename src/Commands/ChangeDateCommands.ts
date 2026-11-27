import { type Command } from 'obsidian';
import { ALL_DATE_FIELDS, type AllTaskDateFields, isAHappensDate } from 'DateTime/DateFieldTypes';
import { createApplyInstructionEditorCallback } from 'Commands/CreateEditorCallback';
import { RemoveTaskDate } from 'ui/EditInstructions/DateInstructions';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';
import { dateFieldCommandNameText } from 'ui/EditInstructions/DateCommandNames';
import { MoveTaskDate, SetTaskDateRelativeToToday } from 'ui/EditInstructions/DateCommandInstructions';

const notATaskMessage = 'Cannot change date: line is not a task or does not match global filter';

/**
 * Return the instructions for the date commands for one date field.
 *
 * Start, Scheduled and Due dates get 'Tomorrow' commands,
 * and Created, Done and Cancelled dates get 'Yesterday' commands,
 * following the direction of the date context menus.
 */
function dateCommandInstructions(field: AllTaskDateFields): TaskEditingInstruction[] {
    const factor = isAHappensDate(field) ? 1 : -1;
    return [
        new SetTaskDateRelativeToToday(field, 0, 'always'),
        new SetTaskDateRelativeToToday(field, factor, 'always'),
        new MoveTaskDate(field, 1, 'day'),
        new MoveTaskDate(field, -1, 'day'),
        new MoveTaskDate(field, 1, 'week'),
        new MoveTaskDate(field, -1, 'week'),
        new RemoveTaskDate(field, `Remove ${dateFieldCommandNameText(field)}`),
    ];
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
