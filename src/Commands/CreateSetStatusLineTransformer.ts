import { type Command, Notice } from 'obsidian';
import { TasksFile } from '../Scripting/TasksFile';
import type { Status } from '../Statuses/Status';
import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';
import type { StatusRegistry } from '../Statuses/StatusRegistry';
import { allStatusInstructions } from '../ui/EditInstructions/StatusInstructions';
import { type EditorInsertion, type LineTransformer, createEditorCallback } from './CreateEditorCallback';

/**
 * Sets a task's status on a single line, returning the new text and cursor position.
 *
 * @param line - The line of text to transform
 * @param path - The file path containing the line
 * @param newStatus - The status to set the task to
 * @returns An EditorInsertion with the new text and cursor position, or undefined if the line is not a task
 */
export const setStatusOnLine = (line: string, path: string, newStatus: Status): EditorInsertion | undefined => {
    const task = Task.fromLine({
        line,
        taskLocation: TaskLocation.fromUnknownPosition(new TasksFile(path)),
        fallbackDate: null,
    });

    if (task !== null) {
        const lines = task.handleNewStatusWithRecurrenceInUsersOrder(newStatus).map((t) => t.toFileLineString());
        const newLineNumber = lines.length > 0 ? lines.length - 1 : 0;
        return { text: lines.join('\n'), moveTo: { line: newLineNumber } };
    }

    return undefined;
};

/**
 * Creates a line transformer that sets a task's status to the given status.
 *
 * @param newStatus - The status to set the task to
 * @returns A LineTransformer function for use with createEditorCallback
 */
export const createSetStatusLineTransformer = (newStatus: Status): LineTransformer => {
    return (line: string, path: string) => {
        const result = setStatusOnLine(line, path, newStatus);
        if (result === undefined) {
            new Notice('Cannot set status: line is not a task or does not match global filter');
        }
        return result;
    };
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
            id: `set-status-${symbolSlug}`,
            name: instruction.instructionDisplayName(),
            editorCheckCallback: createEditorCallback(createSetStatusLineTransformer(status)),
        };
        setStatusCommands.push(command);
    }
    return setStatusCommands;
}
