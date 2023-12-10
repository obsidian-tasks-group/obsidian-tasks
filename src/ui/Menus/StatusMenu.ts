import { Menu, MenuItem } from 'obsidian';
import type { StatusRegistry } from '../../StatusRegistry';
import { replaceTaskWithTasks } from '../../File';
import type { Task } from '../../Task';
import { StatusSettings } from '../../Config/StatusSettings';

type TaskSaver = (originalTask: Task, newTasks: Task | Task[]) => Promise<void>;

async function defaultTaskSaver(originalTask: Task, newTasks: Task | Task[]) {
    await replaceTaskWithTasks({
        originalTask,
        newTasks,
    });
}

export class StatusMenu extends Menu {
    private statusRegistry: StatusRegistry;
    private readonly taskSaver: TaskSaver;

    constructor(statusRegistry: StatusRegistry, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super();

        this.statusRegistry = statusRegistry;
        this.taskSaver = taskSaver;

        const commonTitle = 'Change status to:';

        const getMenuItemCallback = (task: Task, item: MenuItem, statusName: string, newStatusSymbol: string) => {
            const title = `${commonTitle} [${newStatusSymbol}] ${statusName}`;
            item.setTitle(title)
                .setChecked(newStatusSymbol === task.status.symbol)
                .onClick(async () => {
                    if (newStatusSymbol !== task.status.symbol) {
                        const status = this.statusRegistry.bySymbol(newStatusSymbol);
                        const newTask = task.handleStatusChangeFromContextMenuWithRecurrenceInUsersOrder(status);
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
