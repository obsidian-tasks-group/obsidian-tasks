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

        // TODO Add a tooltip, so it's more obvious that right-click is available
        const commonTitle = 'Change status to:';

        const getMenuItemCallback = (item: MenuItem, statusName: string, newStatusSymbol: string) => {
            const title = `${commonTitle} [${newStatusSymbol}] ${statusName}`;
            item.setTitle(title).onClick(() => {
                // TODO Don't make a change if the status is already set to this value.
                const status = this.statusRegistry.bySymbol(newStatusSymbol);
                const newTask = task.handleStatusChangeFromContextMenuWithRecurrenceInUsersOrder(status);
                replaceTaskWithTasks({
                    originalTask: task,
                    newTasks: newTask,
                });
            });
        };

        // TODO Put a checkmark against the current status symbol.
        // TODO Maybe group by status type?
        const coreStatuses = new StatusSettings().coreStatuses.map((setting) => setting.symbol);
        for (const status of statusRegistry.registeredStatuses) {
            if (coreStatuses.includes(status.symbol)) {
                this.addItem((item) => getMenuItemCallback(item, status.name, status.symbol));
            }
        }

        for (const status of statusRegistry.registeredStatuses) {
            if (!coreStatuses.includes(status.symbol)) {
                this.addItem((item) => getMenuItemCallback(item, status.name, status.symbol));
            }
        }
    }
}
