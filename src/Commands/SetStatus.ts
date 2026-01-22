import { Notice } from 'obsidian';
import type { Status } from '../Statuses/Status';
import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';
import { TasksFile } from '../Scripting/TasksFile';
import type { EditorInsertion, LineTransformer } from './CreateEditorCallback';

/**
 * Creates a line transformer that sets a task's status to the given status.
 *
 * @param newStatus - The status to set the task to
 * @returns A LineTransformer function for use with createEditorCallback
 */
export const createSetStatusLineTransformer = (newStatus: Status): LineTransformer => {
    return (line: string, path: string): EditorInsertion => {
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

        // Line is not a task - notify the user
        throw new Notice('Cannot set status: line is not a task or does not match global filter');
    };
};
