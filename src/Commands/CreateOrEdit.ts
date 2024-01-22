import { App, Editor, MarkdownView, View } from 'obsidian';
import { TaskModal } from '../Obsidian/TaskModal';
import type { Task } from '../Task/Task';
import { DateFallback } from '../Task/DateFallback';
import { taskFromLine } from './CreateOrEditTaskParser';

export const createOrEdit = (checking: boolean, editor: Editor, view: View, app: App, allTasks: Task[]) => {
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
        const serialized = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks)
            .map((task: Task) => task.toFileLineString())
            .join('\n');
        editor.setLine(lineNumber, serialized);
    };

    // Need to create a new instance every time, as cursor/task can change.
    const taskModal = new TaskModal({
        app,
        task,
        onSubmit,
        allTasks,
    });
    taskModal.open();
};
