import type { App } from 'obsidian';
import { TaskModal } from '../Obsidian/TaskModal';
import type { Task } from '../Task/Task';
import type TasksPlugin from '../main';
import { taskFromFilePath } from './CreateOrEditTaskParser';

export const createAtIndex = async (app: App, plugin: TasksPlugin) => {
    const file = app.workspace.getActiveFile();
    if (!file) {
        return;
    }

    const allTasks = plugin.getTasks();
    const tickTickApi = plugin.ticktickapi;

    const path = file.path;
    const task = taskFromFilePath({ path });

    const onSubmit = async (updatedTasks: Task[], updatedTask?: Task): Promise<void> => {
        let ticktickId = '';
        let ticktickProjectId = '';
        if (updatedTask) {
            const tickTickTask = await tickTickApi.create(updatedTask);
            if (tickTickTask) {
                ticktickId = tickTickTask.id;
                ticktickProjectId = tickTickTask.projectId;
            }
        }
        const serialized = updatedTasks
            .map((task: Task) => {
                console.log(task.descriptionWithoutTags, updatedTask?.descriptionWithoutTags);
                if (task.descriptionWithoutTags === updatedTask?.descriptionWithoutTags) {
                    task.tickTickId = ticktickId;
                    task.tickTickProjectId = ticktickProjectId;
                }
                return task.toFileLineString();
            })
            .join('\n');
        await app.vault.append(file, serialized + '\n');
        await plugin.ticktickSync(updatedTask);
    };

    const taskModal = new TaskModal({
        app,
        task,
        onSubmit,
        allTasks,
    });
    taskModal.open();
};
