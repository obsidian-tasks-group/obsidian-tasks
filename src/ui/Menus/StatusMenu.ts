import { Menu, MenuItem } from 'obsidian';
import type { StatusRegistry } from '../../StatusRegistry';
import { replaceTaskWithTasks } from '../../File';
import { getSettings } from '../../Config/Settings';
import type { Task } from '../../Task';

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

        // TODO Don't use StatusSettings: they are unchecked and can have duplicates and errors.
        //      Use StatusRegistry.getInstance() instead.
        // TODO Put a checkmark against the current status symbol.
        // TODO Maybe group by status type?
        const { statusSettings } = getSettings();
        for (const status of statusSettings.coreStatuses) {
            this.addItem((item) => getMenuItemCallback(item, status.name, status.symbol));
        }
        for (const status of statusSettings.customStatuses) {
            this.addItem((item) => getMenuItemCallback(item, status.name, status.symbol));
        }
    }
}
