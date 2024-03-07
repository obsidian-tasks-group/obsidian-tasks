import type { App } from 'obsidian';
import type { Task } from '../Task/Task';
import { createTaskLineModal } from './createTaskLineModal';
import { toggleTask } from './toggleTask';
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
        toggleTask: (task: Task): void => {
            return toggleTask(task);
        },
    };
};
