import type TasksPlugin from '../main';
import { toggleLine } from '../Commands/ToggleDone';
import { createTask } from './createTask';
import { createTaskLineModal } from './createTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';
import type { TasksApiV2 } from './TasksApiV2';
import { ensureTaskHasUniqueId } from './TaskV1';
import { editTaskLineModal } from './editTaskLineModal';
import { editTask } from './editTask';
import { queryTasks } from './queryTasks';

/**
 * Factory method for API v1
 *
 * @param plugin - Tasks Plugin instance
 */
export const tasksApiV1 = (plugin: TasksPlugin): TasksApiV1 => {
    const app = plugin.app;
    const onSaveSettings = async () => await plugin.saveSettings();

    return {
        createTaskLineModal: (): Promise<string> => {
            return createTaskLineModal(app, plugin.getTasks(), onSaveSettings);
        },
        editTaskLineModal: (taskLine: string): Promise<string> => {
            return editTaskLineModal(app, taskLine, plugin.getTasks(), onSaveSettings);
        },
        executeToggleTaskDoneCommand: (line: string, path: string) => toggleLine(line, path).text,
    };
};

export const tasksApiV2 = (plugin: TasksPlugin): TasksApiV2 => {
    return {
        ...tasksApiV1(plugin),
        queryTasks: (query: string) => queryTasks(query, plugin.getTasks()),
        createTask: (destination, description, taskData) => createTask(plugin.app, destination, description, taskData),
        editTask: (taskId, taskData) => editTask(plugin.app, plugin.getTasks(), taskId, taskData),
        ensureTaskHasUniqueId: (task) => ensureTaskHasUniqueId(task, plugin.getTasks()),
    };
};
