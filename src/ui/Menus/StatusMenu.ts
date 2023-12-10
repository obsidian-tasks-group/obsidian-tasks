import { Menu, MenuItem } from 'obsidian';
import { StatusRegistry } from '../../StatusRegistry';
import { replaceTaskWithTasks } from '../../File';
import { getSettings } from '../../Config/Settings';
import type { Task } from '../../Task';

export class StatusMenu extends Menu {
    constructor(task: Task) {
        super();

        // TODO Add a tooltip, so it's more obvious that right-click is available
        const commonTitle = 'Change status to:';

        const getMenuItemCallback = (item: MenuItem, statusName: string, newStatusSymbol: string) => {
            item.setTitle(`${commonTitle} ${statusName}`).onClick(() => {
                // TODO Don't make a change if the status is already set to this value.
                const status = StatusRegistry.getInstance().bySymbol(newStatusSymbol);
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
        // TODO Show the status symbol
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
