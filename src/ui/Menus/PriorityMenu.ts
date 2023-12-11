import type { MenuItem } from 'obsidian';
import type { Task } from '../../Task';
import { allPriorityInstructions } from '../EditInstructions/PriorityInstructions';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';
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

        const getMenuItemCallback = (task: Task, item: MenuItem, instruction: TaskEditingInstruction) => {
            item.setTitle(instruction.instructionDisplayName())
                .setChecked(instruction.isCheckedForTask(task))
                .onClick(async () => {
                    const newTask = instruction.apply(task);
                    const hasEdits = newTask.length !== 1 || !Object.is(newTask[0], task);
                    if (hasEdits) {
                        await this.taskSaver(task, newTask);
                    }
                });
        };

        for (const instruction of allPriorityInstructions()) {
            this.addItem((item) => getMenuItemCallback(task, item, instruction));
        }
    }
}
