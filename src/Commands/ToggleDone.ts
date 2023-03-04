import { Editor, type EditorPosition, MarkdownView, View } from 'obsidian';
import { StatusRegistry } from '../StatusRegistry';

import { Task, TaskRegularExpressions } from '../Task';
import { TaskLocation } from '../TaskLocation';

export const toggleDone = (checking: boolean, editor: Editor, view: View) => {
    if (checking) {
        if (!(view instanceof MarkdownView)) {
            // If we are not in a markdown view, the command shouldn't be shown.
            return false;
        }

        // The command should always trigger in a markdown view:
        // - Convert lines to list items.
        // - Convert list items to tasks.
        // - Toggle tasks' status.
        return true;
    }

    if (!(view instanceof MarkdownView)) {
        // Should never happen due to check above.
        return;
    }

    // We are certain we are in the editor due to the check above.
    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const origCursorPos = editor.getCursor();
    const lineNumber = origCursorPos.line;
    const line = editor.getLine(lineNumber);

    const insertion = toggleLine(line, path);
    editor.setLine(lineNumber, insertion.text);

    /* Cursor positions are 0-based for both "line" and "ch" offsets.
     * If "ch" offset bigger than the line length, will just continue to next line(s).
     * By default "editor.setLine()" appears to either keep the cursor at the end of the line if it is already there,
     * ...or move it to the beginning if it is anywhere else. Licat explained this on Discord as "sticking" to one side or another.
     */
    editor.setCursor(getNewCursorPosition(origCursorPos, insertion));
};

/**
 * Represents text to be inserted into the editor
 *
 * @property text The text to insert. May span over multiple lines.
 * @property [moveTo] An {@link EditorPosition} that represents an absolute position within {@link EditorInsertion.text} that is
 *    recommended to move the cursor to.
 *
 * Any combination of subfields (or the whole {@link EditorPosition}) may be omitted.
 * Missing fields should preserve the corresponding cursor position. That is:
 *     * A {@link EditorInsertion.moveTo} that is `undefined` directs the caller to keep the cursor where it is.
 *     * A {@link EditorInsertion.moveTo} that is `{line: 1}` directs the caller of to jump to {@link EditorInsertion.text}'s
 *       second line but stay in the same column.
 *
 * @interface EditorInsertion
 */
interface EditorInsertion {
    text: string;
    moveTo?: Partial<EditorPosition>;
}

export const toggleLine = (line: string, path: string): EditorInsertion => {
    const task = Task.fromLine({
        // Why are we using Task.fromLine instead of the Cache here?
        line,
        taskLocation: TaskLocation.fromUnknownPosition(path), // We don't need precise location to toggle it here in the editor.
        fallbackDate: null, // We don't need this to toggle it here in the editor.
    });
    if (task !== null) {
        const lines = task.toggle().map((t) => t.toFileLineString());
        return { text: lines.join('\n'), moveTo: { line: lines.length - 1 } };
    } else {
        // If the task is null this means that we have one of:
        // 1. a regular checklist item
        // 2. a list item
        // 3. a simple text line
        // 4. a standard task, but which does not contain the global filter, to be toggled, but no done date added.

        // The task regex will match checklist items.
        const regexMatch = line.match(TaskRegularExpressions.taskRegex);
        if (regexMatch !== null) {
            // Toggle the status of the checklist item.
            const statusString = regexMatch[3];
            const status = StatusRegistry.getInstance().bySymbol(statusString);
            const newStatusString = status.nextStatusSymbol;
            return { text: line.replace(TaskRegularExpressions.taskRegex, `$1- [${newStatusString}] $4`) };
        } else if (TaskRegularExpressions.listItemRegex.test(line)) {
            // Convert the list item to a checklist item.
            const text = line.replace(TaskRegularExpressions.listItemRegex, '$1$2 [ ]');
            return { text, moveTo: { ch: text.length } };
        } else {
            // Convert the line to a list item.
            const text = line.replace(TaskRegularExpressions.indentationRegex, '$1- ');
            return { text, moveTo: { ch: text.length } };
        }
    }
};

/**
 * Computes the new position of the cursor, given its current position and an
 * the suggested position within the inserted text.
 *
 * @note Assumes that the insertion occurs at column 0
 *
 * @param startPos The starting cursor position
 * @param insertion The inserted text and suggested cursor position within that text
 */
export const getNewCursorPosition = (startPos: EditorPosition, insertion: EditorInsertion): EditorPosition => {
    const line = insertion.moveTo?.line ?? 0;
    const newCh = insertion.moveTo?.ch ?? startPos.ch;
    return {
        line: startPos.line + line,
        ch: Math.min(newCh, insertion.text.split('\n')[line].length), // This assumes that the inserted text is inserted at column 0
    };
};
