import type { App } from 'obsidian';
import { createOrEditTaskLineModal } from './createOrEditTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';

/**
 * Factory method for API v1
 *
 * @param app - The Obsidian App
 */
export const tasksApiV1 = (app: App): TasksApiV1 => {
    return {
        createOrEditTaskLineModal: (taskLine?: string): Promise<string> => {
            return createOrEditTaskLineModal(app, taskLine);
        },
    };
};
