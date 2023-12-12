import type { Moment, unitOfTime } from 'moment';
import { DateFallback } from '../DateFallback';
import { Task } from '../Task';
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

export function createPostponedTask(
    task: Task,
    dateFieldToPostpone: HappensDate,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) {
    const dateToPostpone = task[dateFieldToPostpone];
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
    return `Task's ${dateFieldToPostpone} postponed until ${postponedDateString}`;
}

export function postponeButtonTitle(task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) {
    const buttonText = postponeMenuItemTitle(task, amount, timeUnit);
    return `ℹ️ ${buttonText} (right-click for more options)`;
}

export function postponeMenuItemTitle(task: Task, amount: number, timeUnit: unitOfTime.DurationConstructor) {
    function capitalizeFirstLetter(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    const updatedDateType = getDateFieldToPostpone(task)!;
    const dateToUpdate = task[updatedDateType] as Moment;

    const postponedDate = new TasksDate(dateToUpdate).postpone(timeUnit, amount);
    const formattedNewDate = postponedDate.format('ddd Do MMM');

    const amountOrArticle = amount > 1 ? amount : 'a';
    if (dateToUpdate.isSameOrBefore(window.moment(), 'day')) {
        const updatedDateDisplayText = capitalizeFirstLetter(updatedDateType.replace('Date', ''));
        return `${updatedDateDisplayText} in ${amountOrArticle} ${timeUnit}, on ${formattedNewDate}`;
    } else {
        const updatedDateDisplayText = updatedDateType.replace('Date', ' date');
        return `Postpone ${updatedDateDisplayText} by ${amountOrArticle} ${timeUnit}, to ${formattedNewDate}`;
    }
}
