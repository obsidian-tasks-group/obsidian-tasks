import { MenuItem, Notice } from 'obsidian';
import type { Moment, unitOfTime } from 'moment/moment';
import type { Task } from '../../Task/Task';
import {
    type HappensDate,
    createFixedDateTask,
    createPostponedTask,
    createTaskWithDateRemoved,
    fixedDateMenuItemTitle,
    getDateFieldToPostpone,
    postponeMenuItemTitle,
    postponementSuccessMessage,
    removeDateMenuItemTitle,
} from '../../Scripting/Postponer';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

type NamingFunction = (task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) => string;

export type PostponingFunction = (
    task: Task,
    dateFieldToPostpone: HappensDate,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) => {
    postponedDate: moment.Moment | null;
    postponedTask: Task;
};

export class PostponeMenu extends TaskEditingMenu {
    constructor(button: HTMLAnchorElement, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const postponeMenuItemCallback = (
            button: HTMLAnchorElement,
            item: MenuItem,
            timeUnit: unitOfTime.DurationConstructor,
            amount: number,
            itemNamingFunction: NamingFunction,
            postponingFunction: PostponingFunction,
        ) => {
            const title = itemNamingFunction(task, amount, timeUnit);
            // TODO Call setChecked() to put a checkmark against the item, if it represents the current task field value.
            item.setTitle(title).onClick(() =>
                PostponeMenu.postponeOnClickCallback(button, task, amount, timeUnit, postponingFunction, taskSaver),
            );
        };

        const fixedTitle = fixedDateMenuItemTitle;
        const fixedDateFunction = createFixedDateTask;
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 0, fixedTitle, fixedDateFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'day', 1, fixedTitle, fixedDateFunction));

        this.addSeparator();

        const titlingFunction = postponeMenuItemTitle;
        const postponingFunction = createPostponedTask;
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 2, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 3, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 4, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 5, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'days', 6, titlingFunction, postponingFunction));

        this.addSeparator();

        this.addItem((item) => postponeMenuItemCallback(button, item, 'week', 1, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'weeks', 2, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'weeks', 3, titlingFunction, postponingFunction));
        this.addItem((item) => postponeMenuItemCallback(button, item, 'month', 1, titlingFunction, postponingFunction));

        this.addSeparator();

        this.addItem((item) =>
            postponeMenuItemCallback(button, item, 'days', 2, removeDateMenuItemTitle, createTaskWithDateRemoved),
        );
    }

    public static async postponeOnClickCallback(
        button: HTMLAnchorElement,
        task: Task,
        amount: number,
        timeUnit: unitOfTime.DurationConstructor,
        postponingFunction: PostponingFunction = createPostponedTask,
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
        button: HTMLAnchorElement,
        updatedDateType: HappensDate,
        postponedDate: Moment | null,
    ) {
        // Disable the button to prevent update error due to the task not being reloaded yet.
        button.style.pointerEvents = 'none';

        const successMessage = postponementSuccessMessage(postponedDate, updatedDateType);
        new Notice(successMessage, 2000);
    }
}
