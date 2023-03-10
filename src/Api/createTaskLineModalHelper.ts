import type { App } from 'obsidian';
import type { Task } from '../Task';
import { taskFromLine } from '../Commands/CreateOrEditTaskParser';
import { TaskModal } from '../TaskModal';
import type { ITaskModal, taskModalFactory } from './createTaskLineModal';

/**
 * Factory method to create a new {@link TaskModal}.
 *
 * The current setup of Jest does not work with Svelte, therefore it is necessary to remove
 * all code referencing {@link EditTask} from the file {@link createTaskLineModal} lives in, to make it testable.
 * Once Jest is configured to work with Svelte, this can be moved in the same file as {@link createTaskLineModal}.
 *
 * @param app - The Obsidian App
 * @param onSubmit - Callback to be run when the {@link EditTask} form is submitted to retrieve the edited task.
 */
export const defaultTaskModalFactory: taskModalFactory = (
    app: App,
    onSubmit: (updatedTasks: Task[]) => void,
): ITaskModal => {
    const task = taskFromLine({ line: '', path: '' });
    return new TaskModal({ app, task, onSubmit }) as ITaskModal;
};
