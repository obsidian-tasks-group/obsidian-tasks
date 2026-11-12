import {
    type Command,
    type Editor,
    type EditorChange,
    type MarkdownFileInfo,
    type MarkdownView,
    Notice,
} from 'obsidian';
import { TasksFile } from 'Scripting/TasksFile';
import type { Status } from 'Statuses/Status';
import { Task } from 'Task/Task';
import { TaskLocation } from 'Task/TaskLocation';
import type { StatusRegistry } from 'Statuses/StatusRegistry';
import { allStatusInstructions } from 'ui/EditInstructions/StatusInstructions';
import {
    type EditorInsertion,
    createEditorCallback,
    replaceLineChange,
    selectedLineNumbers,
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
 * Creates an editor callback that sets the status of the task on the cursor's line,
 * or, when the selections cover several lines, of every task on those lines.
 *
 * Lines in a multi-line selection that are not tasks are left unchanged.
 *
 * @param newStatus - The status to set the tasks to
 */
export const createSetStatusEditorCallback = (newStatus: Status) => {
    const noChangeMessage = notATaskMessage;

    const singleLineCallback = createEditorCallback((line: string, path: string) => {
        const result = setStatusOnLine(line, path, newStatus);
        if (result === undefined) {
            new Notice(noChangeMessage);
        }
        return result;
    });

    return (checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
        if (checking) {
            return singleLineCallback(checking, editor, view);
        }

        const lineNumbers = selectedLineNumbers(editor.listSelections());
        if (lineNumbers.length <= 1) {
            return singleLineCallback(checking, editor, view);
        }

        const path = view.file?.path;
        if (path === undefined) {
            return;
        }

        const changes: EditorChange[] = [];
        for (const lineNumber of lineNumbers) {
            const insertion = setStatusOnLine(editor.getLine(lineNumber), path, newStatus);
            if (insertion !== undefined) {
                changes.push(replaceLineChange(editor, lineNumber, insertion.text));
            }
        }

        if (changes.length === 0) {
            new Notice(noChangeMessage);
            return;
        }

        // A single transaction, so that one Undo reverts all the changes.
        editor.transaction({ changes });
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
            id: `set-status-symbol-to-${symbolSlug}`,
            name: instruction.instructionDisplayName(),
            editorCheckCallback: createSetStatusEditorCallback(status),
        };
        setStatusCommands.push(command);
    }
    return setStatusCommands;
}
