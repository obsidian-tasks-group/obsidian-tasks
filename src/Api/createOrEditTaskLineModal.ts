import type { App } from 'obsidian';
import type { Task } from '../Task';
import { taskFromLine } from '../Commands/CreateOrEditTaskParser';
import { TaskModal } from '../TaskModal';

/**
 * Opens the Tasks UI and returns the Markdown string for the task entered.
 * If the optional Markdown string for a task is passed, the form will be
 * populated with that task's properties.
 *
 * @param app - The Obsidian App
 * @param taskLine - Optional Markdown string of the task to edit.
 *
 * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
 * an empty string, if data entry was cancelled.
 */
export const createOrEditTaskLineModal = (app: App, taskLine?: string): Promise<string> => {
    let resolvePromise: (input: string) => void;
    const waitForClose = new Promise<string>((resolve, _) => {
        resolvePromise = resolve;
    });

    const onSubmit = (updatedTasks: Task[]): void => {
        const line = updatedTasks.map((task: Task) => task.toFileLineString()).join('\n');
        resolvePromise(line);
    };

    const task = taskFromLine({ line: taskLine ?? '', path: '' });
    const taskModal = new TaskModal({ app, task, onSubmit });
    taskModal.open();
    return waitForClose;
};
