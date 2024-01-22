import type { Moment, unitOfTime } from 'moment';
import { DateFallback } from '../Task/DateFallback';
import { Task } from '../Task/Task';
import { TasksDate } from './TasksDate';

export function shouldShowPostponeButton(task: Task) {
    // don't postpone if any invalid dates
    for (const dateField of Task.allDateFields()) {
        const taskElement = task[dateField] as Moment;
        if (taskElement && !taskElement.isValid()) {
            return false;
        }
    }

    // require a valid happens date to postpone
    const hasAValidHappensDate = task.happensDates.some((date) => {
        return !!date?.isValid();
    });

    // only postpone not done tasks
    return !task.isDone && hasAValidHappensDate;
}

export type HappensDate = keyof Pick<Task, 'startDate' | 'scheduledDate' | 'dueDate'>;

/**
 * Gets a {@link HappensDate} field from a {@link Task} with the following priority: due > scheduled > start.
 * If the task has no happens field {@link HappensDate}, null is returned.
 *
 * @param task
 */
export function getDateFieldToPostpone(task: Task): HappensDate | null {
    if (task.dueDate) {
        return 'dueDate';
    }

    if (task.scheduledDate) {
        return 'scheduledDate';
    }

    if (task.startDate) {
        return 'startDate';
    }

    return null;
}

/**
 * Postpone a date value in a task a certain number of increments from the field's current date.
 * @param task
 * @param dateFieldToPostpone - The field whose value is to be postponed
 * @param timeUnit - the increment to postpone by (day, week, month....)
 * @param amount - the number of timeUnits to increment by.
 *
 * @see createFixedDateTask
 */
export function createPostponedTask(
    task: Task,
    dateFieldToPostpone: HappensDate,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) {
    const dateToPostpone = task[dateFieldToPostpone];
    return createPostponedTaskFromDate(dateToPostpone, task, dateFieldToPostpone, timeUnit, amount);
}

/**
 * Set a date value in a task a certain number of increments from today's date.
 * @param task
 * @param dateFieldToPostpone - The field whose value is to be postponed
 * @param timeUnit - the increment to postpone by (day, week, month....)
 * @param amount - the number of timeUnits to increment by.
 *
 * @see createPostponedTask
 */
export function createFixedDateTask(
    task: Task,
    dateFieldToPostpone: HappensDate,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) {
    const dateToPostpone = window.moment();
    return createPostponedTaskFromDate(dateToPostpone, task, dateFieldToPostpone, timeUnit, amount);
}

function createPostponedTaskFromDate(
    dateToPostpone: moment.Moment | null,
    task: Task,
    dateFieldToPostpone: HappensDate,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) {
    const postponedDate = new TasksDate(dateToPostpone).postpone(timeUnit, amount);
    const postponedTask = DateFallback.removeInferredStatusIfNeeded(task, [
        new Task({
            ...task,
            [dateFieldToPostpone]: postponedDate,
        }),
    ])[0];
    return { postponedDate, postponedTask };
}

export function postponementSuccessMessage(postponedDate: Moment, dateFieldToPostpone: HappensDate) {
    // TODO all logic for invalid dates
    const postponedDateString = postponedDate?.format('DD MMM YYYY');
    return `Task's ${dateFieldToPostpone} changed to ${postponedDateString}`;
}

export function postponeButtonTitle(task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) {
    const buttonText = postponeMenuItemTitle(task, amount, timeUnit);
    return `ℹ️ ${buttonText} (right-click for more options)`;
}

function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Get the menu text to use when changing a task date relative to its current value.
 * @param task
 * @param amount - the number of timeUnits to increment by.
 * @param timeUnit - the increment to postpone by (day, week, month....)
 *
 * @see fixedDateMenuItemTitle
 */
export function postponeMenuItemTitle(task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) {
    const updatedDateType = getDateFieldToPostpone(task)!;
    const dateToUpdate = task[updatedDateType] as Moment;
    return postponeMenuItemTitleFromDate(updatedDateType, dateToUpdate, amount, timeUnit);
}

/**
 * Get the menu text to use when changing a task date relative to today's date.
 * @param task
 * @param amount - the number of timeUnits to increment by.
 * @param timeUnit - the increment to postpone by (day, week, month....)
 *
 * @see postponeMenuItemTitle
 */
export function fixedDateMenuItemTitle(task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) {
    const updatedDateType = getDateFieldToPostpone(task)!;
    const dateToUpdate = window.moment().startOf('day');
    return postponeMenuItemTitleFromDate(updatedDateType, dateToUpdate, amount, timeUnit);
}

function postponeMenuItemTitleFromDate(
    updatedDateType: HappensDate,
    dateToUpdate: moment.Moment,
    amount: number,
    timeUnit: unitOfTime.DurationConstructor,
) {
    const postponedDate = new TasksDate(dateToUpdate).postpone(timeUnit, amount);
    const formattedNewDate = postponedDate.format('ddd Do MMM');

    const amountOrArticle = amount != 1 ? amount : 'a';
    if (dateToUpdate.isSameOrBefore(window.moment(), 'day')) {
        const updatedDateDisplayText = capitalizeFirstLetter(updatedDateType.replace('Date', ''));
        return `${updatedDateDisplayText} in ${amountOrArticle} ${timeUnit}, on ${formattedNewDate}`
            .replace(' in 0 days', ' today')
            .replace('in a day', 'tomorrow');
    } else {
        const updatedDateDisplayText = updatedDateType.replace('Date', ' date');
        return `Postpone ${updatedDateDisplayText} by ${amountOrArticle} ${timeUnit}, to ${formattedNewDate}`;
    }
}
