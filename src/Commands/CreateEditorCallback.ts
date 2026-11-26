import {
    Editor,
    type EditorChange,
    type EditorPosition,
    type EditorSelection,
    type MarkdownFileInfo,
    MarkdownView,
    Notice,
} from 'obsidian';
import { Task } from 'Task/Task';
import { TaskLocation } from 'Task/TaskLocation';
import { TasksFile } from 'Scripting/TasksFile';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';

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
export interface EditorInsertion {
    text: string;
    moveTo?: Partial<EditorPosition>;
}

/**
 * A function that transforms a line of text, returning the new text and cursor position.
 * Returns undefined to indicate no changes should be made.
 */
export type LineTransformer = (line: string, path: string) => EditorInsertion | undefined;

/**
 * A function that transforms a Task, returning the edited task or tasks
 * as Markdown lines.
 * An extra line typically means that a new recurring task was created.
 * An empty array typically means that the task was completed and was marked to be deleted.
 */
export type TaskTransformer = (task: Task) => string[];

/**
 * Computes the new absolute position of the cursor so that it is positioned within the inserted text as specified
 * by {@link insertion}.moveTo.
 *
 * @note This function assumes that text was inserted at the beginning of the line, which is
 *       the case when used together with {@link Editor.setLine}. This is a simplifying assumption,
 *       but may result in incorrect behavior if used outside the intended context (i.e. not by {@link toggleDone}).
 *
 *       Example: Assume {@link insertion}=`{text: "Hello World", moveTo: {line: 0, ch: 6}}`, where {@link insertion}.text
 *                had been appended to a line with content "------":  `------Hello World`.
 *                The cursor will be offset to the left by the number of characters that were already on the line.
 *                Resulting in the incorrect result `------|Hello World` instead of the intended `------Hello |World`.
 *
 * @param startPos The starting cursor position
 * @param insertion The inserted text and suggested cursor position within that text
 */
export const getNewCursorPosition = (startPos: EditorPosition, insertion: EditorInsertion): EditorPosition => {
    const defaultMoveTo = { line: 0, ch: startPos.ch };
    // Fill in any missing moveTo values using the default
    const moveTo = { ...defaultMoveTo, ...insertion.moveTo };
    // Find the length of the line we're moving the cursor to, so that cursor isn't moved out of bounds
    const destinationLineLength = insertion.text.split('\n')[moveTo.line].length;

    return {
        line: startPos.line + moveTo.line,
        ch: Math.min(moveTo.ch, destinationLineLength),
    };
};

/**
 * Returns the change that replaces the given line with {@link text}.
 *
 * If {@link text} is empty and the line is followed by a new line character,
 * the change deletes the line and the new-line, to avoid leaving a blank line in the file.
 */
export const replaceLineChange = (editor: Editor, lineNumber: number, text: string): EditorChange => {
    const from = { line: lineNumber, ch: 0 };
    const lineIsLastLine = lineNumber >= editor.lineCount() - 1;
    if (text.length > 0 || lineIsLastLine) {
        return { from, to: { line: lineNumber, ch: editor.getLine(lineNumber).length }, text };
    }
    return { from, to: { line: lineNumber + 1, ch: 0 }, text: '' };
};

/**
 * Creates an editor callback function that applies a line transformation to the current line.
 *
 * @param lineTransformer - A function that takes the current line and file path, and returns the transformed text
 * @param getLineNumber - Returns the number of the line to transform. Defaults to the cursor's line.
 * @returns An editor callback suitable for use with Obsidian's `editorCheckCallback`
 */
export const createEditorCallback = (
    lineTransformer: LineTransformer,
    getLineNumber: (editor: Editor) => number = (editor) => editor.getCursor().line,
) => {
    function editorCallback(checking: boolean, editor: Editor, view: MarkdownView | MarkdownFileInfo) {
        if (checking) {
            if (!(view instanceof MarkdownView)) {
                // If we are not in a markdown view, the command shouldn't be shown.
                return false;
            }

            // TODO - Decide if we want to only show these commands on lines which are tasks
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
        const lineNumber = getLineNumber(editor);
        const line = editor.getLine(lineNumber);

        const insertion = lineTransformer(line, path);

        // If the transformer returns undefined, make no changes
        if (insertion === undefined) {
            return;
        }

        const change = replaceLineChange(editor, lineNumber, insertion.text);
        editor.replaceRange(change.text, change.from, change.to);

        /* Cursor positions are 0-based for both "line" and "ch" offsets.
         * If "ch" offset bigger than the line length, will just continue to next line(s).
         * By default "editor.setLine()" appears to either keep the cursor at the end of the line if it is already there,
         * ...or move it to the beginning if it is anywhere else. Licat explained this on Discord as "sticking" to one side or another.
         */
        editor.setCursor(getNewCursorPosition(origCursorPos, insertion));
    }

    return editorCallback;
};

/**
 * Returns the numbers of the lines covered by the given selections, in ascending order.
 *
 * A selection that ends at the very start of a line does not include that line,
 * as happens when selecting whole lines by dragging down to the start of the next line.
 */
export function selectedLineNumbers(selections: EditorSelection[]): number[] {
    const lineNumbers = new Set<number>();
    for (const { anchor, head } of selections) {
        const [from, to] = anchor.line <= head.line ? [anchor, head] : [head, anchor];
        const lastLine = to.line > from.line && to.ch === 0 ? to.line - 1 : to.line;
        for (let line = from.line; line <= lastLine; line++) {
            lineNumbers.add(line);
        }
    }
    return [...lineNumbers].sort((a, b) => a - b);
}

/**
 * Transforms a task on a single line, returning the new text and cursor position.
 *
 * @param line - The line of text to transform
 * @param path - The file path containing the line
 * @param taskTransformer - A function that transforms the parsed task into replacement lines
 * @returns An EditorInsertion with the new text and cursor position, or undefined if the line is not a task
 */
export function transformTaskOnLine(
    line: string,
    path: string,
    taskTransformer: TaskTransformer,
): EditorInsertion | undefined {
    const task = Task.fromLine({
        line,
        taskLocation: TaskLocation.fromUnknownPosition(new TasksFile(path)),
        fallbackDate: null,
    });

    if (task !== null) {
        const lines = taskTransformer(task);
        const newLineNumber = lines.length > 0 ? lines.length - 1 : 0;
        return { text: lines.join('\n'), moveTo: { line: newLineNumber } };
    }

    return undefined;
}

/**
 * Apply a TaskEditingInstruction to a task on a single line, returning the new text and cursor position.
 *
 * @param line - The line of text to transform
 * @param path - The file path containing the line
 * @param instruction - The instruction to edit the task
 * @returns An EditorInsertion with the new text and cursor position, or undefined if the line is not a task
 */
export const applyInstructionToLine = (
    line: string,
    path: string,
    instruction: TaskEditingInstruction,
): EditorInsertion | undefined => {
    const taskTransformer = (task: Task): string[] => instruction.apply(task).map((t) => t.toFileLineString());
    return transformTaskOnLine(line, path, taskTransformer);
};

/**
 * Creates an editor callback that applies a TaskEditingInstruction to the task on the cursor's line,
 * or, when the selections cover several lines, of every task on those lines.
 *
 * Lines in a multi-line selection that are not tasks are left unchanged.
 *
 * @param instruction - The instruction to edit the task
 * @param notATaskMessage - The message to display when no task lines are found in the selection
 */
export const createApplyInstructionEditorCallback = (instruction: TaskEditingInstruction, notATaskMessage: string) => {
    return createMultiLineEditorCallback(
        (line: string, path: string) => applyInstructionToLine(line, path, instruction),
        notATaskMessage,
    );
};

/**
 * Creates an editor callback that applies a line transformation to every line covered by the selections.
 *
 * When the selections cover a single line, it behaves like {@link createEditorCallback}.
 * Lines for which the transformer returns undefined are left unchanged.
 *
 * @param lineTransformer - A function that takes a line and file path, and returns the transformed text
 * @param noChangeMessage - Shown to the user, once, if the transformer changed no lines
 * @returns An editor callback suitable for use with Obsidian's `editorCheckCallback`
 */
export function createMultiLineEditorCallback(lineTransformer: LineTransformer, noChangeMessage: string) {
    const lineTransformerWithNotice = (line: string, path: string) => {
        const insertion = lineTransformer(line, path);
        if (insertion === undefined) {
            new Notice(noChangeMessage);
        }
        return insertion;
    };
    const singleLineCallback = createEditorCallback(
        lineTransformerWithNotice,
        // Use the selected line, which differs from the cursor's line if the selection ends at the start of the next line.
        (editor: Editor) => selectedLineNumbers(editor.listSelections())[0],
    );

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
            const insertion = lineTransformer(editor.getLine(lineNumber), path);
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
}
