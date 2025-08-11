import type { App } from 'obsidian';
import type { Task } from '../Task/Task';
import { taskFromLine } from '../Commands/CreateOrEditTaskParser';
import { TaskModal } from '../Obsidian/TaskModal';

/**
 * Opens the Tasks UI and returns the Markdown string for the task entered.
 * If the optional Markdown string for a task is passed, the form will be
 * populated with that task's properties.
 *
 * @param app - The Obsidian App
 * @param taskLine - Markdown string of the task to edit.
 * @param allTasks - An array of all tasks, used to populate the modal dependencies fields
 *
 * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
 * an empty string, if data entry was cancelled.
 */
export function editTaskLineModal(app: App, taskLine: string, allTasks: Task[]): Promise<string> {
    let resolvePromise: (input: string) => void;
    const waitForClose = new Promise<string>((resolve, _) => {
        resolvePromise = resolve;
    });

    const onSubmit = (updatedTasks: Task[]): void => {
        const line = updatedTasks.map((task: Task) => task.toFileLineString()).join('\n');
        resolvePromise(line);
    };

    const task = taskFromLine({ line: taskLine ?? '', path: '' });
    const taskModal = new TaskModal({ app, task, onSubmit, allTasks });

    taskModal.open();
    return waitForClose;
}
