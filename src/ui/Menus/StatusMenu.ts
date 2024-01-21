import type { StatusRegistry } from '../../Statuses/StatusRegistry';
import type { Task } from '../../Task/Task';
import { allStatusInstructions } from '../EditInstructions/StatusInstructions';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

/**
 * A Menu of options for editing the status of a Task object.
 *
 * @example
 *     checkbox.addEventListener('contextmenu', (ev: MouseEvent) => {
 *         const menu = new StatusMenu(StatusRegistry.getInstance(), task);
 *         menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
 *     });
 *     checkbox.setAttribute('title', 'Right-click for options');
 */
export class StatusMenu extends TaskEditingMenu {
    /**
     * Constructor, which sets up the menu items.
     * @param statusRegistry - the statuses to be shown in the menu.
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(statusRegistry: StatusRegistry, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const instructions = allStatusInstructions(statusRegistry);
        this.addItemsForInstructions(instructions, task);
    }
}
