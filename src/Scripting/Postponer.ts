import type { Moment, unitOfTime } from 'moment';
import { Task } from '../Task';
import { TasksDate } from './TasksDate';

export function shouldShowPostponeButton(task: Task) {
    return !task.isDone;
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
    dateTypeToUpdate: HappensDate,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) {
    const dateToUpdate = task[dateTypeToUpdate] as Moment;
    const postponedDate = new TasksDate(dateToUpdate).postpone(timeUnit, amount);
    const newTasks = new Task({ ...task, [dateTypeToUpdate]: postponedDate });
    return { postponedDate, newTasks };
}

export function postponementSuccessMessage(postponedDate: Moment, updatedDateType: HappensDate) {
    // TODO all logic for invalid dates
    const postponedDateString = postponedDate?.format('DD MMM YYYY');
    return `Task's ${updatedDateType} postponed until ${postponedDateString}`;
}
