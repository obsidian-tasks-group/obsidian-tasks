import type { MenuItem } from 'obsidian';
import type { StatusRegistry } from '../../StatusRegistry';
import type { Task } from '../../Task';
import { StatusSettings } from '../../Config/StatusSettings';
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
    private statusRegistry: StatusRegistry;

    /**
     * Constructor, which sets up the menu items.
     * @param statusRegistry - the statuses to be shown in the menu.
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(statusRegistry: StatusRegistry, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        this.statusRegistry = statusRegistry;

        const commonTitle = 'Change status to:';

        const getMenuItemCallback = (task: Task, item: MenuItem, statusName: string, newStatusSymbol: string) => {
            const title = `${commonTitle} [${newStatusSymbol}] ${statusName}`;
            item.setTitle(title)
                .setChecked(newStatusSymbol === task.status.symbol)
                .onClick(async () => {
                    if (newStatusSymbol !== task.status.symbol) {
                        const status = this.statusRegistry.bySymbol(newStatusSymbol);
                        const newTask = task.handleNewStatusWithRecurrenceInUsersOrder(status);
                        await this.taskSaver(task, newTask);
                    }
                });
        };

        const coreStatuses = new StatusSettings().coreStatuses.map((setting) => setting.symbol);
        // Put the core statuses at the top of the menu:
        for (const matchCoreTask of [true, false]) {
            for (const status of statusRegistry.registeredStatuses) {
                if (coreStatuses.includes(status.symbol) === matchCoreTask) {
                    this.addItem((item) => getMenuItemCallback(task, item, status.name, status.symbol));
                }
            }
        }
    }
}
