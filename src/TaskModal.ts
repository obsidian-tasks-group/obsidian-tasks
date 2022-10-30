import { App, Modal } from 'obsidian';
import EditTask from './ui/EditTask.svelte';
import type { Task } from './Task';

export class TaskModal extends Modal {
    public readonly task: Task;
    public readonly onSubmit: (updatedTasks: Task[]) => void;

    constructor({ app, task, onSubmit }: { app: App; task: Task; onSubmit: (updatedTasks: Task[]) => void }) {
        super(app);

        this.task = task;
        this.onSubmit = (updatedTasks: Task[]) => {
            updatedTasks.length && onSubmit(updatedTasks);
            this.close();
        };
    }

    public onOpen(): void {
        this.titleEl.setText('Create or edit Task');
        const { contentEl } = this;
        new EditTask({
            target: contentEl,
            props: { task: this.task, onSubmit: this.onSubmit },
        });
    }

    public onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
