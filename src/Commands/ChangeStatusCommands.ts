import { type Command } from 'obsidian';
import type { Status } from 'Statuses/Status';
import { Task } from 'Task/Task';
import type { StatusRegistry } from 'Statuses/StatusRegistry';
import { allStatusInstructions } from 'ui/EditInstructions/StatusInstructions';
import {
    type EditorInsertion,
    createMultiLineEditorCallback,
    transformTaskOnLine,
} from 'Commands/CreateEditorCallback';

const notATaskMessage = 'Cannot set status: line is not a task or does not match global filter';

/**
 * Sets a task's status on a single line, returning the new text and cursor position.
 *
 * @param line - The line of text to transform
 * @param path - The file path containing the line
 * @param newStatus - The status to set the task to
 * @returns An EditorInsertion with the new text and cursor position, or undefined if the line is not a task
 */
export const setStatusOnLine = (line: string, path: string, newStatus: Status): EditorInsertion | undefined => {
    const taskTransformer = (task: Task): string[] =>
        task.handleNewStatusWithRecurrenceInUsersOrder(newStatus).map((t) => t.toFileLineString());
    return transformTaskOnLine(line, path, taskTransformer);
};

/**
 * Creates an editor callback that sets the status of the task on the cursor's line,
 * or, when the selections cover several lines, of every task on those lines.
 *
 * Lines in a multi-line selection that are not tasks are left unchanged.
 *
 * @param newStatus - The status to set the tasks to
 */
export const createSetStatusEditorCallback = (newStatus: Status) => {
    return createMultiLineEditorCallback(
        (line: string, path: string) => setStatusOnLine(line, path, newStatus),
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
            editorCheckCallback: createSetStatusEditorCallback(status),
        };
        setStatusCommands.push(command);
    }
    return setStatusCommands;
}
