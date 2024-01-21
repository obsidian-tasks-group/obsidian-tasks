import type { App } from 'obsidian';
import type { Task } from '../Task/Task';

/**
 * Interface to remove all references to {TaskModal} in this file.
 * This is necessary to make {createTaskLineModal} testable.
 * Once Jest is configured to work with Svelte, this can be removed.
 */
export interface ITaskModal {
    open(): void;
}

/**
 * Signature of the factory method for {@link TaskModal}.
 * This is necessary to make {@link createTaskLineModal} testable.
 * Once Jest is configured to work with Svelte, this can be removed.
 */
export type taskModalFactory = {
    (app: App, onSubmit: (updatedTasks: Task[]) => void): ITaskModal;
};

/**
 * Opens the Tasks UI and returns the Markdown string for the task entered.
 *
 * @param app - The Obsidian App
 * @param taskModalFactory - Factory method to instantiate {@link TaskModal}. Default value is {@link defaultTaskModalFactory}.
 *                           Used only for testing.
 *
 * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
 * an empty string, if data entry was cancelled.
 */
export const createTaskLineModal = (app: App, taskModalFactory: taskModalFactory): Promise<string> => {
    let resolvePromise: (input: string) => void;
    const waitForClose = new Promise<string>((resolve, _) => {
        resolvePromise = resolve;
    });

    const onSubmit = (updatedTasks: Task[]): void => {
        const line = updatedTasks.map((task: Task) => task.toFileLineString()).join('\n');
        resolvePromise(line);
    };

    const taskModal = taskModalFactory(app, onSubmit);
    taskModal.open();
    return waitForClose;
};
