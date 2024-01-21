import type { App } from 'obsidian';
import type { Task } from '../Task/Task';
import { taskFromLine } from '../Commands/CreateOrEditTaskParser';
import { TaskModal } from '../Obsidian/TaskModal';
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
    // TODO This is going to need some thought. It is missing the Cache argument.
    //      This file is part of the Tasks API that allows users to open the Edit Task modal from JavaScript:
    //          https://publish.obsidian.md/tasks/Advanced/Tasks+Api
    //      As a published API, to change the parameters would be a breaking change.
    //      One option is to make the allTasks parameter to the Edit task modal be optional,
    //      and if it's not provided, then hide the dependency fields in the modal.
    //      For now, we pass in an empty list of tasks.
    return new TaskModal({ app, task, onSubmit, allTasks: [] }) as ITaskModal;
};
