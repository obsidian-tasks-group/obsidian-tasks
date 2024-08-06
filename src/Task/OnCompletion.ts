import { Notice } from 'obsidian';
import { StatusType } from '../Statuses/StatusConfiguration';
import type { Task } from './Task';

export enum OnCompletion {
    Ignore = '',
    Delete = 'delete',
}

function returnWithoutCompletedInstance(tasks: Task[], changedStatusTask: Task) {
    return tasks.filter((task) => task !== changedStatusTask);
}

export function handleOnCompletion(originalTask: Task, newTasks: Task[]): Task[] {
    const tasksArrayLength = newTasks.length;
    if (tasksArrayLength === 0) {
        return newTasks;
    }
    const startStatus = originalTask.status;

    const changedStatusTask = newTasks[tasksArrayLength - 1];
    const endStatus = changedStatusTask.status;

    if (!originalTask.onCompletion || endStatus.type !== StatusType.DONE || endStatus.type === startStatus.type) {
        return newTasks;
    }

    const ocAction: OnCompletion = originalTask.onCompletion;

    if (OnCompletion.Delete === ocAction) {
        return returnWithoutCompletedInstance(newTasks, changedStatusTask);
    }

    const errorText = 'Unknown "On Completion" action: ' + originalTask.onCompletion;
    const hintText = '\nClick here to clear';
    const noticeText = errorText + hintText;
    new Notice(noticeText, 0);
    return newTasks;
}
