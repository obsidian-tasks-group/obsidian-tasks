import type { App } from 'obsidian';
import { toggleLine } from 'Commands/ToggleDone';
import { TASK_FORMATS } from 'Config/Settings';
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
        toggleLine,
        getDefaultTaskSerializer: () => TASK_FORMATS.tasksPluginEmoji.taskSerializer,
        getDataviewTaskSerializer: () => TASK_FORMATS.dataview.taskSerializer,
    };
};
