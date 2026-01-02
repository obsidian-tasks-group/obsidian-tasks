import { type App, setIcon } from 'obsidian';
import { Modal } from 'obsidian';
import type { EditModalShowSettings } from '../Config/EditModalShowSettings';
import { getSettings, settingsStore } from '../Config/Settings';

import EditTask from '../ui/EditTask.svelte';
import type { Task } from '../Task/Task';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import { Status } from '../Statuses/Status';
import { OptionsModal } from './OptionsModal';

export interface TaskModalParams {
    app: App;
    task: Task;
    onSaveSettings: () => Promise<void>;
    onSubmit: (updatedTasks: Task[]) => void;
    allTasks: Task[];
}

export class TaskModal extends Modal {
    public readonly task: Task;
    public readonly onSaveSettings: () => Promise<void>;
    public readonly onSubmit: (updatedTasks: Task[]) => void;
    public readonly allTasks: Task[];

    constructor({ app, task, onSaveSettings, onSubmit, allTasks }: TaskModalParams) {
        super(app);

        this.task = task;
        this.allTasks = allTasks;
        this.onSaveSettings = onSaveSettings;
        this.onSubmit = (updatedTasks: Task[]) => {
            updatedTasks.length && onSubmit(updatedTasks);
            this.close();
        };
    }

    public onOpen(): void {
        settingsStore.set(getSettings());

        this.titleEl.setText('Create or edit Task');
        this.modalEl.style.paddingBottom = '0';

        const optionsButton = document.createElement('button');
        // These are classes of the default close button.
        // We need to overwrite only the 'inset-inline-end' to position the button properly.
        optionsButton.addClasses(['modal-close-button', 'mod-raised', 'clickable-icon']);
        optionsButton.style.insetInlineEnd = '32px';
        setIcon(optionsButton, 'settings');
        optionsButton.onclick = () => {
            const optionsModal = new OptionsModal({
                app: this.app,
                onSave: (isShownInEditModal: EditModalShowSettings) => {
                    this.onSaveSettings().then(() => settingsStore.set({ ...getSettings(), isShownInEditModal }));
                },
            });
            optionsModal.open();
        };
        this.modalEl.appendChild(optionsButton);

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
}
