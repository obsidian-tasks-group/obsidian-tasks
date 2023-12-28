import type { StatusRegistry } from '../../StatusRegistry';
import type { Task } from '../../Task';
import { StatusSettings } from '../../Config/StatusSettings';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';
import { SetStatus } from '../EditInstructions/StatusInstructions';
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

        const instructions: TaskEditingInstruction[] = [];
        const coreStatuses = new StatusSettings().coreStatuses.map((setting) => setting.symbol);
        // Put the core statuses at the top of the menu:
        for (const matchCoreTask of [true, false]) {
            for (const status of statusRegistry.registeredStatuses) {
                if (coreStatuses.includes(status.symbol) === matchCoreTask) {
                    instructions.push(new SetStatus(status));
                }
            }
        }

        this.addItemsForInstructions(instructions, task);
    }
}
