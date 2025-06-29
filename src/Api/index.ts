import type { Plugin } from 'obsidian';
import { toggleLine } from '../Commands/ToggleDone';
import { createTaskLineModal } from './createTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';

/**
 * Factory method for API v1
 *
 * @param app - The Obsidian App
 */
export const tasksApiV1 = (plugin: Plugin): TasksApiV1 => {
    const app = plugin.app;

    return {
        createTaskLineModal: (): Promise<string> => {
            return createTaskLineModal(app);
        },
        executeToggleTaskDoneCommand: (line: string, path: string) => toggleLine(line, path).text,
    };
};
