import { Menu, MenuItem } from 'obsidian';
import type { StatusRegistry } from '../../StatusRegistry';
import { replaceTaskWithTasks } from '../../File';
import type { Task } from '../../Task';
import { StatusSettings } from '../../Config/StatusSettings';

export class StatusMenu extends Menu {
    private statusRegistry: StatusRegistry;

    constructor(statusRegistry: StatusRegistry, task: Task) {
        super();

        this.statusRegistry = statusRegistry;

        const commonTitle = 'Change status to:';

        const getMenuItemCallback = (task: Task, item: MenuItem, statusName: string, newStatusSymbol: string) => {
            const title = `${commonTitle} [${newStatusSymbol}] ${statusName}`;
            item.setTitle(title)
                .setChecked(newStatusSymbol === task.status.symbol)
                .onClick(() => {
                    if (newStatusSymbol !== task.status.symbol) {
                        const status = this.statusRegistry.bySymbol(newStatusSymbol);
                        const newTask = task.handleStatusChangeFromContextMenuWithRecurrenceInUsersOrder(status);
                        replaceTaskWithTasks({
                            originalTask: task,
                            newTasks: newTask,
                        });
                    }
                });
        };

        const coreStatuses = new StatusSettings().coreStatuses.map((setting) => setting.symbol);
        // Put the core statuses at the top of the menu:
        for (const status of statusRegistry.registeredStatuses) {
            if (coreStatuses.includes(status.symbol)) {
                this.addItem((item) => getMenuItemCallback(task, item, status.name, status.symbol));
            }
        }

        // Then add the custom statuses:
        for (const status of statusRegistry.registeredStatuses) {
            if (!coreStatuses.includes(status.symbol)) {
                this.addItem((item) => getMenuItemCallback(task, item, status.name, status.symbol));
            }
        }
    }
}
