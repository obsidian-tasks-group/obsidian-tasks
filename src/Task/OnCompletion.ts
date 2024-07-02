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

export function handleOnCompletion(task: Task, tasks: Task[]): Task[] {
    const tasksArrayLength = tasks.length;
    if (tasksArrayLength === 0) {
        return tasks;
    }
    const startStatus = task.status;

    const changedStatusTask = tasks[tasksArrayLength - 1];
    const endStatus = changedStatusTask.status;

    if (!task.onCompletion || endStatus.type !== StatusType.DONE || endStatus.type === startStatus.type) {
        return tasks;
    }

    const ocAction = task.onCompletion.toLowerCase();

    if ('delete' === ocAction) {
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
    }

    const errorText = 'Unknown "On Completion" action: ' + task.onCompletion;
    const hintText = '\nClick here to clear';
    const noticeText = errorText + hintText;
    new Notice(noticeText, 0);
    return tasks;
}
