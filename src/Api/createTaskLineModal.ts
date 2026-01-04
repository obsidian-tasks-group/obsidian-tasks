import type { App } from 'obsidian';
import type { Task } from '../Task/Task';
import { taskFromLine } from '../Commands/CreateOrEditTaskParser';
import { TaskModal } from '../Obsidian/TaskModal';

/**
 * Opens the Tasks UI and returns the Markdown string for the task entered.
 *
 * @param app - The Obsidian App
 * @param allTasks - All Tasks Plugin tasks in the vault
 * @param onSaveSettings - function to save the plugin settings
 * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
 * an empty string, if data entry was cancelled.
 */
export const createTaskLineModal = (
    app: App,
    allTasks: Task[],
    onSaveSettings: () => Promise<void>,
): Promise<string> => {
    let resolvePromise: (input: string) => void;
    const waitForClose = new Promise<string>((resolve, _) => {
        resolvePromise = resolve;
    });

    const onSubmit = (updatedTasks: Task[]): void => {
        const line = updatedTasks.map((task: Task) => task.toFileLineString()).join('\n');
        resolvePromise(line);
    };

    const task = taskFromLine({ line: '', path: '' });
    const taskModal = new TaskModal({
        app,
        task,
        onSaveSettings,
        onSubmit,
        allTasks,
    });

    taskModal.open();

    return waitForClose;
};
