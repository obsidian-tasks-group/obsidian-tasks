import type { App } from 'obsidian';
import type { Task } from '../../src/Task/Task';

/**
 * {@link TaskModal} needs to be mocked, because it depends on {@link obsidian.Modal}, which is not available.
 */
export class TaskModal {
    public static instance: TaskModal;
    public readonly app: App;
    public readonly task: Task;
    public readonly onSubmit: (updateTasks: Task[]) => void;
    public readonly allTasks: Task[];

    public readonly open: () => void;

    constructor({
        app,
        task,
        onSubmit,
        onCancel,
        allTasks,
    }: {
        app: App;
        task: Task;
        onSubmit: (updatedTasks: Task[]) => void;
        onCancel?: () => void;
        allTasks?: Task[];
    }) {
        this.app = app;
        this.task = task;
        this.onSubmit = (updatedTasks: Task[]) => {
            if (updatedTasks.length > 0) {
                onSubmit(updatedTasks);
            } else if (onCancel) {
                onCancel();
            }
        };
        this.open = jest.fn();
        this.allTasks = allTasks || [];

        TaskModal.instance = this;
    }

    public cancel(): void {
        this.onSubmit([]);
    }
}
