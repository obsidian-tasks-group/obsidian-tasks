import { App, Editor, MarkdownView, View } from 'obsidian';
import { moveLineToArchiveFile } from '../Obsidian/ArchiveFile';
import { TaskModal } from '../Obsidian/TaskModal';
import { findTaskToArchive } from '../Task/OnCompletion';
import type { Task } from '../Task/Task';
import { DateFallback } from '../DateTime/DateFallback';
import { taskFromLine } from './CreateOrEditTaskParser';

export const createOrEdit = (
    checking: boolean,
    editor: Editor,
    view: View,
    app: App,
    allTasks: Task[],
    onSaveSettings: () => Promise<void>,
) => {
    if (checking) {
        return view instanceof MarkdownView;
    }

    if (!(view instanceof MarkdownView)) {
        // Should never happen due to check above.
        return;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);
    const task = taskFromLine({ line, path });

    const onSubmit = (updatedTasks: Task[]): void => {
        const tasksToWrite = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks);
        const serialized = tasksToWrite.map((t) => t.toFileLineString()).join('\n');
        editor.setLine(lineNumber, serialized);
        moveLineToArchiveFile(app.vault, editor, path, lineNumber, findTaskToArchive(task, tasksToWrite));
    };

    // Need to create a new instance every time, as cursor/task can change.
    const taskModal = new TaskModal({
        app,
        task,
        onSaveSettings,
        onSubmit,
        allTasks,
    });
    taskModal.open();
};
