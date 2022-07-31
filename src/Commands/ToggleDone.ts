import { Editor, MarkdownView, View } from 'obsidian';

import { Task } from '../Task';

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

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);

    const toggledLine = toggleLine({ line, path });
    editor.setLine(lineNumber, toggledLine);
    const newCursorPosition = editor.getCursor();

    /* Cursor positions are 0-based for both "line" and "ch" offsets.
     * If "ch" offset bigger than the line length, will just continue to next line(s).
     * By default "editor.setLine()" appears to either keep the cursor at the end of the line if it is already there,
     * ...or move it to the beginning if it is anywhere else. Licat explained this (on Discord) as "sticking" to one side or another.
     * Previously, Tasks would reset+move-right the cursor if there was any text in the line, including something inside the checkbox,
     * moving right by toggledLine.length - line.length (still moves right, but by less if the toggledLine is shorter than the old).
     * This missed the need to move right on the blank line to "- " case (issue #460).
     * This also meant the cursor moved nonsensically if it was before any newly inserted text,
     * such as a done date at the end of the line, or after the ">" when "> -" -> "> - [ ]".
     */

    /* Cases:
    0) Toggle Task Done on [\s\t>]* produces "$1- " Adds 2 chars. Issue: #460 if the line is blank.
    1) Toggle Task Done on [\s\t>]*- produces "$1- [ ] ". Adds 4 chars.
    2) Toggle Task Done on "- Wibble" produces "- [ ] Wibble". Adds 4 chars.
    3) Toggle Task Done on "- [ ] Wibble" with global filter not present produces "- [x] Wibble". No length change.
    4) Toggle Task Done on "- [ ] Wibble" with no global filter produces "- [x] Wibble ✅ YYYY-MM-DD". Adds 13 chars.
        Current behavior has cursor move right 13 characters, regardless of start position. Issue #449
    5) Toggle Task Done on "- [x] Wibble ✅ YYYY-MM-DD" with global filter present produces "- [] Wibble". Removes 13 chars. Cursor moves left 13 characters sometimes, otherwise behavior is confusing.
    */

    /* Cases (another way):
    0) Line got shorter: done date removed from end of task, cursor should reset or be moved to new end if reset position is too long.
    1) Line stayed the same length: Checking & unchecking textbox that is not a task - cursor should reset.
    2) Line got longer:
        a) Dash could have been added. Find it in new text: if cursor was at or right of where it was added, move the cursor right 2.
        b) Empty checkbox could have been added. If cursor was after the (in old or new), it should move right by 3.
        c) Done emoji and date could have been added to the end. Cursor should reset if 0, and stay end of line otherwise.
        d) Recurring task could have been added to the beginning and done emoji and date added to the end. Current behavior adds so much to the offset to make this right.

    So cursor should be reset if 0, which includes being moved to new end if got shorter. Then might need to move right 2 or 3.
    */

    if (newCursorPosition.ch === 0) {
        // If setLine moved the cursor to the beginning of the line adjust it
        editor.setCursor({
            line: cursorPosition.line,
            // Works for recurring tasks, done date removal, checking non-task checkboxes, and when the cursor is after any additions
            ch: cursorPosition.ch + toggledLine.length - line.length,
        });
        // Need some additional logic for if the cursor is before additions of dash, checkbox or done date just put it at cursorPosition.ch and not add the line difference
    }
};

const toggleLine = ({ line, path }: { line: string; path: string }): string => {
    let toggledLine = line;

    const task = Task.fromLine({
        line,
        path,
        sectionStart: 0, // We don't need this to toggle it here in the editor.
        sectionIndex: 0, // We don't need this to toggle it here in the editor.
        precedingHeader: null, // We don't need this to toggle it here in the editor.
    });
    if (task !== null) {
        toggledLine = toggleTask({ task });
    } else {
        // If the task is null this means that we have one of:
        // 1. a regular checklist item
        // 2. a list item
        // 3. a simple text line

        // The task regex will match checklist items.
        const regexMatch = line.match(Task.taskRegex);
        if (regexMatch !== null) {
            toggledLine = toggleChecklistItem({ regexMatch });
        } else {
            // This is not a checklist item. It is one of:
            // 1. a list item
            // 2. a simple text line

            if (Task.listItemRegex.test(line)) {
                // Let's convert the list item to a checklist item.
                toggledLine = line.replace(Task.listItemRegex, '$1$2 [ ]');
            } else {
                // Let's convert the line to a list item.
                toggledLine = line.replace(Task.indentationRegex, '$1- ');
            }
        }
    }

    return toggledLine;
};

const toggleTask = ({ task }: { task: Task }): string => {
    // Toggle a regular task.
    const toggledTasks = task.toggle();
    const serialized = toggledTasks
        .map((task: Task) => task.toFileLineString())
        .join('\n');

    return serialized;
};

const toggleChecklistItem = ({
    regexMatch,
}: {
    regexMatch: RegExpMatchArray;
}): string => {
    // It's a checklist item, let's toggle it.
    const indentation = regexMatch[1];
    const statusString = regexMatch[2].toLowerCase();
    const body = regexMatch[3];

    const toggledStatusString = statusString === ' ' ? 'x' : ' ';

    const toggledLine = `${indentation}- [${toggledStatusString}] ${body}`;

    return toggledLine;
};
