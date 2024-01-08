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
            itemNamingFunction: (task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) => string,
            postponingFunction: (
                task: Task,
                dateFieldToPostpone: HappensDate,
                timeUnit: unitOfTime.DurationConstructor,
                amount: number,
            ) => {
                postponedDate: moment.Moment;
                postponedTask: Task;
            },
        ) => {
            const title = itemNamingFunction(task, amount, timeUnit);
            item.setTitle(title).onClick(() =>
                PostponeMenu.postponeOnClickCallback(button, task, amount, timeUnit, postponingFunction, taskSaver),
            );
        };

        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'days', 2, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'days', 3, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'days', 4, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'days', 5, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'days', 6, postponeMenuItemTitle, createPostponedTask),
        );
        this.addSeparator();
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'week', 1, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'weeks', 2, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'weeks', 3, postponeMenuItemTitle, createPostponedTask),
        );
        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'month', 1, postponeMenuItemTitle, createPostponedTask),
        );
    }

    public static async postponeOnClickCallback(
        button: HTMLButtonElement,
        task: Task,
        amount: number,
        timeUnit: unitOfTime.DurationConstructor,
        postponingFunction: (
            task: Task,
            dateFieldToPostpone: HappensDate,
            timeUnit: unitOfTime.DurationConstructor,
            amount: number,
        ) => {
            postponedDate: moment.Moment;
            postponedTask: Task;
        } = createPostponedTask,
        taskSaver: TaskSaver = defaultTaskSaver,
    ) {
        const dateFieldToPostpone = getDateFieldToPostpone(task);
        if (dateFieldToPostpone === null) {
            const errorMessage = '⚠️ Postponement requires a date: due, scheduled or start.';
            return new Notice(errorMessage, 10000);
        }

        const { postponedDate, postponedTask } = postponingFunction(task, dateFieldToPostpone, timeUnit, amount);

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
