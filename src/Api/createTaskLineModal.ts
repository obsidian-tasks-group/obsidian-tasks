import type { App } from 'obsidian';
import type { Task } from '../Task/Task';
import { editTaskLineModal } from './editTaskLineModal';

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
    return editTaskLineModal(app, '', allTasks, onSaveSettings);
};
