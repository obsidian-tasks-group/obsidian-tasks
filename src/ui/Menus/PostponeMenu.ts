import { MenuItem, Notice } from 'obsidian';
import type { Moment, unitOfTime } from 'moment/moment';
import type { Task } from '../../Task';
import {
    type HappensDate,
    createPostponedTask,
    getDateFieldToPostpone,
    postponeMenuItemTitle,
    postponementSuccessMessage,
} from '../../Scripting/Postponer';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class PostponeMenu extends TaskEditingMenu {
    constructor(button: HTMLButtonElement, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const postponeMenuItemCallback = (
            button: HTMLButtonElement,
            item: MenuItem,
            timeUnit: unitOfTime.DurationConstructor,
            amount = 1,
        ) => {
            const title = postponeMenuItemTitle(task, amount, timeUnit);
            item.setTitle(title).onClick(() =>
                PostponeMenu.postponeOnClickCallback(button, task, amount, timeUnit, taskSaver),
            );
        };

        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 2));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 3));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 4));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 5));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 6));
        this.addSeparator();
        this.addItem((item) => postponeMenuItemCallback(button, item, 'week'));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'weeks', 2));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'weeks', 3));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'month'));
    }

    public static async postponeOnClickCallback(
        button: HTMLButtonElement,
        task: Task,
        amount: number,
        timeUnit: unitOfTime.DurationConstructor,
        taskSaver: TaskSaver = defaultTaskSaver,
    ) {
        const dateFieldToPostpone = getDateFieldToPostpone(task);
        if (dateFieldToPostpone === null) {
            const errorMessage = '⚠️ Postponement requires a date: due, scheduled or start.';
            return new Notice(errorMessage, 10000);
        }

        const { postponedDate, postponedTask } = createPostponedTask(task, dateFieldToPostpone, timeUnit, amount);

        await taskSaver(task, postponedTask);
        PostponeMenu.postponeSuccessCallback(button, dateFieldToPostpone, postponedDate);
    }

    private static postponeSuccessCallback(
        button: HTMLButtonElement,
        updatedDateType: HappensDate,
        postponedDate: Moment,
    ) {
        // Disable the button to prevent update error due to the task not being reloaded yet.
        button.disabled = true;

        const successMessage = postponementSuccessMessage(postponedDate, updatedDateType);
        new Notice(successMessage, 2000);
    }
}
