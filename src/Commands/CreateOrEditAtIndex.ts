import type { App, TFile } from 'obsidian';
import type { TickTickApi } from 'TickTick/api';
import { TaskModal } from '../Obsidian/TaskModal';
import type { Task } from '../Task/Task';
import { taskFromNothing } from './CreateOrEditTaskParser';

// TEST COMMENT
export const createAtIndex = async (app: App, allTasks: Task[], tickTickApi: TickTickApi) => {
    const path = 'Tasks/Inbox.md';
    const file = app.vault.getAbstractFileByPath(path) as TFile;
    console.log('file', file);
    if (!file) {
        return;
    }
    console.log('got file');

    let content = await app.vault.read(file);
    const contentArray = content.split('\n');
    const task = taskFromNothing({ path });

    const onSubmit = async (updatedTasks: Task[], updatedTask?: Task): Promise<void> => {
        let ticktickId = '';
        let ticktickProjectId = '';
        if (updatedTask) {
            const tickTickTask = await tickTickApi.create(updatedTask);
            console.log('created ticktick task', tickTickTask);
            ticktickId = tickTickTask.id;
            ticktickProjectId = tickTickTask.projectId;
        }
        const serialized = updatedTasks
            .map((task: Task) => {
                if (task.id === updatedTask?.id) {
                    task.tickTickId = ticktickId;
                    task.tickTickProjectId = ticktickProjectId;
                }
                return task.toFileLineString();
            })
            .join('\n');
        console.log('serialized', serialized);
        contentArray.splice(0, 0, serialized);
        content = contentArray.join('\n');
        await app.vault.modify(file, content);
    };

    const taskModal = new TaskModal({
        app,
        task,
        onSubmit,
        allTasks,
    });
    taskModal.open();
};
