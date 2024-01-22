import { Menu, type MenuItem } from 'obsidian';
import type { Task } from '../../Task/Task';
import { replaceTaskWithTasks } from '../../Obsidian/File';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';

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

    protected addItemsForInstructions(instructions: TaskEditingInstruction[], task: Task) {
        for (const instruction of instructions) {
            this.addItemForInstruction(task, instruction);
        }
    }

    private addItemForInstruction(task: Task, instruction: TaskEditingInstruction) {
        this.addItem((item) => this.getMenuItemCallback(task, item, instruction));
    }

    private getMenuItemCallback(task: Task, item: MenuItem, instruction: TaskEditingInstruction) {
        item.setTitle(instruction.instructionDisplayName())
            .setChecked(instruction.isCheckedForTask(task))
            .onClick(async () => {
                const newTask = instruction.apply(task);
                const hasEdits = newTask.length !== 1 || !Object.is(newTask[0], task);
                if (hasEdits) {
                    await this.taskSaver(task, newTask);
                }
            });
    }
}
