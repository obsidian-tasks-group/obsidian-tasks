import type { App, TFile } from 'obsidian';
import { TaskModal } from '../Obsidian/TaskModal';
import type { Task } from '../Task/Task';
import { taskFromNothing } from './CreateOrEditTaskParser';

// TEST COMMENT
export const createAtIndex = async (app: App, allTasks: Task[]) => {
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

    const onSubmit = async (updatedTasks: Task[]): Promise<void> => {
        const serialized = updatedTasks.map((task: Task) => task.toFileLineString()).join('\n');
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
