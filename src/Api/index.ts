import type { App } from 'obsidian';
import { toggleLine } from '../Commands/ToggleDone';
import { createTaskLineModal, createTaskLineModalFromString } from './createTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';
import { defaultTaskModalFactory, defaultTaskModalFactoryfromString } from './createTaskLineModalHelper';

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
        createTaskLineModalFromString: (description: string): Promise<string> => {
            return createTaskLineModalFromString(app, defaultTaskModalFactoryfromString, description);
        },
        executeToggleTaskDoneCommand: (line: string, path: string) => toggleLine(line, path).text,
    };
};
