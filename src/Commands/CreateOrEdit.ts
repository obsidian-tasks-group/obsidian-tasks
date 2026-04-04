import { App, Editor, MarkdownView, View } from 'obsidian';
import { TaskModal } from '../Obsidian/TaskModal';
import { Task } from '../Task/Task';
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
        const shouldClearInferred = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks);
        const serialized = updatedTasks
            .map((t: Task, i: number) => {
                if (shouldClearInferred[i]) {
                    return new Task({ ...t, scheduledDateIsInferred: false }).toFileLineString();
                }
                return t.toFileLineString();
            })
            .join('\n');
        editor.setLine(lineNumber, serialized);
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
