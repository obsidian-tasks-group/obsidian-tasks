import { App, Editor, MarkdownView, View } from 'obsidian';
import type { TickTickApi } from 'TickTick/api';
import { TaskModal } from '../Obsidian/TaskModal';
import type { Task } from '../Task/Task';
import { DateFallback } from '../DateTime/DateFallback';
import { taskFromLine } from './CreateOrEditTaskParser';

export const createOrEdit = (
    checking: boolean,
    editor: Editor,
    view: View,
    app: App,
    allTasks: Task[],
    tickTickApi: TickTickApi,
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

    const onSubmit = async (updatedTasks: Task[], updatedTask?: Task): Promise<void> => {
        if (updatedTask) {
            await tickTickApi.update(updatedTask);
        }
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
