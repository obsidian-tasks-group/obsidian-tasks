import type { App } from 'obsidian';
import { createTaskLineModal } from './createTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';
import { defaultTaskModalFactory } from './createTaskLineModalHelper';

/**
 * Factory method for API v1
 *
 * @param app - The Obsidian App
 */
export const tasksApiV1 = (app: App): TasksApiV1 => {
    return {
        createTaskLineModal: (): Promise<string> => {
            return createTaskLineModal(app, defaultTaskModalFactory);
        },
    };
};
