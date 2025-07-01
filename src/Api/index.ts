import type TasksPlugin from '../main';
import { toggleLine } from '../Commands/ToggleDone';
import { createTaskLineModal } from './createTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';

/**
 * Factory method for API v1
 *
 * @param app - The Obsidian App
 */
export const tasksApiV1 = (plugin: TasksPlugin): TasksApiV1 => {
    const app = plugin.app;

    return {
        createTaskLineModal: (): Promise<string> => {
            return createTaskLineModal(app, plugin.getTasks());
        },
        executeToggleTaskDoneCommand: (line: string, path: string) => toggleLine(line, path).text,
    };
};
