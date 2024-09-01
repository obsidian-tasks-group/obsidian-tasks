import { App, Modal } from 'obsidian';
import type flatpickr from 'flatpickr';

import EditTask from '../ui/EditTask.svelte';
import type { Task } from '../Task/Task';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import { Status } from '../Statuses/Status';

export interface IFlatpickrUser {
    setActiveFlatpickrInstance(instance: flatpickr.Instance): void;
    clearActiveFlatpickrInstance(): void;
}

export class TaskModal extends Modal implements IFlatpickrUser {
    public readonly task: Task;
    public readonly onSubmit: (updatedTasks: Task[]) => void;
    public readonly allTasks: Task[];
    private activeFlatpickrInstance: flatpickr.Instance | null = null;

    constructor({
        app,
        task,
        onSubmit,
        allTasks,
    }: {
        app: App;
        task: Task;
        onSubmit: (updatedTasks: Task[]) => void;
        allTasks: Task[];
    }) {
        super(app);

        this.task = task;
        this.allTasks = allTasks;
        this.onSubmit = (updatedTasks: Task[]) => {
            if (this.activeFlatpickrInstance) {
                // Ignore onSubmit if the date-picker is open:
                // For some unknown reason, making the date-picker lunched from a Button
                // caused the modal to be automatically submitted before the user had
                // even seen the date picker.
                return;
            }
            updatedTasks.length && onSubmit(updatedTasks);
            this.close();
        };
    }

    public onOpen(): void {
        this.titleEl.setText('Create or edit Task');
        this.modalEl.style.paddingBottom = '0';

        const { contentEl } = this;
        this.contentEl.style.paddingBottom = '0';

        const statusOptions = this.getKnownStatusesAndCurrentTaskStatusIfNotKnown();

        new EditTask({
            target: contentEl,
            props: {
                task: this.task,
                statusOptions: statusOptions,
                onSubmit: this.onSubmit,
                allTasks: this.allTasks,
                modal: this,
            },
        });
    }

    /**
     * If the task being edited has an unknown status, make sure it is added
     * to the dropdown list.
     * This allows the user to switch to a different status and then change their
     * mind and return to the initial status.
     */
    private getKnownStatusesAndCurrentTaskStatusIfNotKnown() {
        const statusOptions: Status[] = StatusRegistry.getInstance().registeredStatuses;
        if (StatusRegistry.getInstance().bySymbol(this.task.status.symbol) === Status.EMPTY) {
            statusOptions.push(this.task.status);
        }
        return statusOptions;
    }

    public onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }

    /**
     * Make sure that if the date picker is open, an Escape key only closes
     * the date-picker, and not the EditTask modal as well.
     */
    public onEscapeKey(): void {
        if (this.activeFlatpickrInstance?.isOpen) {
            this.activeFlatpickrInstance.close();
            this.activeFlatpickrInstance = null;
        } else {
            this.close();
        }
    }

    public setActiveFlatpickrInstance(instance: flatpickr.Instance): void {
        this.activeFlatpickrInstance = instance;
    }

    public clearActiveFlatpickrInstance(): void {
        this.activeFlatpickrInstance = null;
    }
}
