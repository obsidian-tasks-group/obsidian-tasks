import { MarkdownView } from 'obsidian';
import type { App, Editor, View } from 'obsidian';
import type { Task } from '../Task/Task';
import { openMoveTaskModal } from '../ui/Menus/MoveTaskModal';

/**
 * Command handler for moving a task to another file or section.
 *
 * @param checking - If true, only check if the command can be executed
 * @param editor - The current editor
 * @param view - The current view
 * @param app - The Obsidian app instance
 * @param allTasks - All known tasks in the vault
 * @returns true if the command can be executed (when checking), void otherwise
 */
export const moveTask = (checking: boolean, editor: Editor, view: View, app: App, allTasks: Task[]): boolean | void => {
    if (!(view instanceof MarkdownView)) {
        return checking ? false : undefined;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return checking ? false : undefined;
    }

    const cursorPosition = editor.getCursor();
    const task = findTaskAtLine(allTasks, path, cursorPosition.line);

    if (checking) {
        return task !== null;
    }

    if (task === null) {
        return;
    }

    openMoveTaskModal(app, task, allTasks, cursorPosition.line);
};

/**
 * Find a task at a specific line in a file.
 *
 * @param allTasks - All tasks to search through
 * @param path - The file path to match
 * @param lineNumber - The line number to match
 * @returns The task at that location, or null if not found
 */
export function findTaskAtLine(allTasks: Task[], path: string, lineNumber: number): Task | null {
    return (
        allTasks.find((task) => task.taskLocation.path === path && task.taskLocation.lineNumber === lineNumber) ?? null
    );
}
