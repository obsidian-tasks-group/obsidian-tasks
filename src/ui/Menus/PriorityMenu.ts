import type { MenuItem } from 'obsidian';
import { Priority, Task } from '../../Task';
import { SetPriority } from '../EditInstructions/PriorityInstructions';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

/**
 * A Menu of options for editing the status of a Task object.
 *
 * @example
 *     editTaskPencil.addEventListener('contextmenu', (ev: MouseEvent) => {
 *         const menu = new PriorityMenu(task);
 *         menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
 *     });
 *     editTaskPencil.setAttribute('title', 'Right-click for options');
 */
export class PriorityMenu extends TaskEditingMenu {
    /**
     * Constructor, which sets up the menu items.
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const getMenuItemCallback = (task: Task, item: MenuItem, newPriority: Priority, instruction: SetPriority) => {
            item.setTitle(instruction.instructionDisplayName())
                .setChecked(newPriority === task.priority)
                .onClick(async () => {
                    if (newPriority !== task.priority) {
                        const newTask = new Task({
                            ...task,
                            priority: newPriority,
                        });
                        await this.taskSaver(task, newTask);
                    }
                });
        };

        const allPriorities = [
            Priority.Highest,
            Priority.High,
            Priority.Medium,
            Priority.None,
            Priority.Low,
            Priority.Lowest,
        ];
        for (const priority of allPriorities) {
            const instruction = new SetPriority(priority);
            this.addItem((item) => getMenuItemCallback(task, item, priority, instruction));
        }
    }
}
