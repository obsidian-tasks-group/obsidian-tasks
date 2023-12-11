import { Menu } from 'obsidian';
import type { Task } from '../../Task';
import { replaceTaskWithTasks } from '../../File';

/**
 * A function for replacing one task with zero or more new tasks.
 * @see {@link defaultTaskSaver}
 */
export type TaskSaver = (originalTask: Task, newTasks: Task | Task[]) => Promise<void>;

/**
 * A default implementation of {@link TaskSaver} that calls {@link replaceTaskWithTasks}
 * @param originalTask
 * @param newTasks
 */
export async function defaultTaskSaver(originalTask: Task, newTasks: Task | Task[]) {
    await replaceTaskWithTasks({
        originalTask,
        newTasks,
    });
}

/**
 * Base class for Menus that offer editing one or more properties of a Task object.
 *
 * A {@link TaskSaver} function must be supplied, in order for any edits to be saved.
 * Derived classes should default to using {@link defaultTaskSaver}, but allow
 * alternative implementations to be used in tests.
 */
export class TaskEditingMenu extends Menu {
    protected readonly taskSaver: TaskSaver;

    /**
     * Constructor, which sets up the menu items.
     * @param taskSaver - a {@link TaskSaver} function, for saving any edits.
     */
    constructor(taskSaver: TaskSaver) {
        super();

        this.taskSaver = taskSaver;
    }
}
