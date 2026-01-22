import { TasksFile } from '../Scripting/TasksFile';
import { StatusRegistry } from '../Statuses/StatusRegistry';

import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import { type EditorInsertion, createEditorCallback } from './CreateEditorCallback';

// Re-export for backwards compatibility with existing test imports
export { getNewCursorPosition } from './CreateEditorCallback';

export const toggleLine = (line: string, path: string): EditorInsertion => {
    const task = Task.fromLine({
        // Why are we using Task.fromLine instead of the Cache here?
        line,
        taskLocation: TaskLocation.fromUnknownPosition(new TasksFile(path)), // We don't need precise location to toggle it here in the editor.
        fallbackDate: null, // We don't need this to toggle it here in the editor.
    });
    if (task !== null) {
        const lines = task.toggleWithRecurrenceInUsersOrder().map((t) => t.toFileLineString());
        const newLineNumber = lines.length > 0 ? lines.length - 1 : 0;
        return { text: lines.join('\n'), moveTo: { line: newLineNumber } };
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

export const toggleDone = createEditorCallback(toggleLine);
