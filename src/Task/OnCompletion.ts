import { StatusType } from '../Statuses/StatusConfiguration';
import type { Task } from './Task';

export enum OnCompletion {
    Ignore = '',
    Keep = 'keep', // Like Ignore, but is visible on task lines
    Delete = 'delete',
    ToFile = 'to_file',
}

export function parseOnCompletionValue(inputOnCompletionValue: string) {
    const onCompletionString = inputOnCompletionValue.trim().toLowerCase();
    if (onCompletionString === 'delete') {
        return OnCompletion.Delete;
    } else if (onCompletionString === 'keep') {
        return OnCompletion.Keep;
    } else if (onCompletionString === 'to_file') {
        return OnCompletion.ToFile;
    } else {
        return OnCompletion.Ignore;
    }
}

function returnWithoutCompletedInstance(tasks: Task[], changedStatusTask: Task) {
    return tasks.filter((task) => task !== changedStatusTask);
}

function keepTasks(originalTask: Task, changedStatusTask: Task) {
    const startStatus = originalTask.status;
    const endStatus = changedStatusTask.status;

    const statusDidNotChange = endStatus.type === startStatus.type;
    const endStatusIsNotDone = endStatus.type !== StatusType.DONE;

    return endStatusIsNotDone || statusDidNotChange;
}

export function handleOnCompletion(originalTask: Task, newTasks: Task[]): Task[] {
    const tasksArrayLength = newTasks.length;
    if (
        originalTask.onCompletion === OnCompletion.Ignore ||
        originalTask.onCompletion === OnCompletion.Keep ||
        // The code that writes these tasks moves the completed instance afterwards: see findTaskToArchive().
        originalTask.onCompletion === OnCompletion.ToFile ||
        tasksArrayLength === 0
    ) {
        return newTasks;
    }
    const changedStatusTask = newTasks[tasksArrayLength - 1];
    const keepAllTasks = keepTasks(originalTask, changedStatusTask);
    if (keepAllTasks) {
        return newTasks;
    }

    const ocAction: OnCompletion = originalTask.onCompletion;

    if (ocAction === OnCompletion.Delete) {
        return returnWithoutCompletedInstance(newTasks, changedStatusTask);
    }

    // We will only reach here when adding a new option to OnCompletion, and before
    // the handler code has been added. This is expected to be found in tests.
    console.warn(`OnCompletion action ${ocAction as string} not yet implemented.`);

    return newTasks;
}

/**
 * A completed {@link OnCompletion.ToFile} task, and its offset from the first line written in place of its own.
 */
export interface TaskToArchive {
    task: Task;
    lineOffset: number;
}

/**
 * Find the completed instance that a status change on a {@link OnCompletion.ToFile} task produced,
 * so that the caller can move it to the archive file once it has written `newTasks`.
 *
 * Returns undefined when the task stays where it is, under the same conditions as {@link OnCompletion.Delete}
 * keeps one: the new status isn't DONE, or the task was already DONE.
 *
 * @param originalTask - the task before its status changed
 * @param newTasks - the tasks that the status change returned, in the order they will be written
 */
export function findTaskToArchive(originalTask: Task, newTasks: Task[]): TaskToArchive | undefined {
    // A next occurrence normally gets a TODO or IN_PROGRESS status, so the completed instance is the one DONE task.
    const doneTasks = newTasks.filter((task) => task.status.type === StatusType.DONE);
    if (doneTasks.length !== 1) {
        return undefined;
    }

    // The completed instance holds any edit made to the action while completing the task.
    const [task] = doneTasks;
    if (task.onCompletion !== OnCompletion.ToFile || keepTasks(originalTask, task)) {
        return undefined;
    }

    return { task, lineOffset: newTasks.indexOf(task) };
}
