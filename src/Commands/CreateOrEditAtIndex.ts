import type { App } from 'obsidian';
import type { TickTickApi } from 'TickTick/api';
import { TaskModal } from '../Obsidian/TaskModal';
import type { Task } from '../Task/Task';
import { taskFromNothing } from './CreateOrEditTaskParser';

export const createAtIndex = async (app: App, allTasks: Task[], tickTickApi: TickTickApi) => {
    const file = app.workspace.getActiveFile();
    if (!file) {
        return;
    }

    const path = file.path;
    const task = taskFromNothing({ path });

    const onSubmit = async (updatedTasks: Task[], updatedTask?: Task): Promise<void> => {
        let ticktickId = '';
        let ticktickProjectId = '';
        if (updatedTask) {
            const tickTickTask = await tickTickApi.create(updatedTask);
            ticktickId = tickTickTask.id;
            ticktickProjectId = tickTickTask.projectId;
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
    };

    const taskModal = new TaskModal({
        app,
        task,
        onSubmit,
        allTasks,
    });
    taskModal.open();
};
