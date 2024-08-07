import { StatusType } from '../Statuses/StatusConfiguration';
import type { Task } from './Task';

export enum OnCompletion {
    Ignore = '',
    Keep = 'keep', // Like Ignore, but is visible on task lines
    Delete = 'delete',
}

export function parseOnCompletionValue(inputOnCompletionValue: string) {
    const onCompletionString = inputOnCompletionValue.trim().toLowerCase();
    if (onCompletionString === 'delete') {
        return OnCompletion.Delete;
    } else if (onCompletionString === 'keep') {
        return OnCompletion.Keep;
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
    console.log(`OnCompletion action ${ocAction} not yet implemented.`);

    return newTasks;
}
