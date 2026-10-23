import type TasksPlugin from '../main';
import { toggleLine } from '../Commands/ToggleDone';
import { QueryRenderer } from '../Renderer/QueryRenderer';
import type { ReadOnlyTask } from '../Task/ReadOnlyTask';
import { GlobalQuery } from '../Config/GlobalQuery';
import { createTaskLineModal } from './createTaskLineModal';
import type { TasksApiV1 } from './TasksApiV1';
import { editTaskLineModal } from './editTaskLineModal';
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
        queryTasks: (querySource: string, queryPath?: string): ReadOnlyTask[] => {
            if (queryPath !== undefined && typeof queryPath !== 'string') {
                throw new Error('queryTasks: queryPath must be a string');
            }

            const tasksFile = queryPath === undefined ? undefined : QueryRenderer.getTasksFile(app, queryPath);

            return queryTasks(querySource, plugin.getTasks(), GlobalQuery.getInstance(), tasksFile);
        },
    };
};
