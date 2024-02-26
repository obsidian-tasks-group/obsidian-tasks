import Console from 'console';
import type { Status } from '../Statuses/Status';
import { StatusType } from '../Statuses/StatusConfiguration';
import type { Task } from './Task';

function handleOnCompletion(tasks: Task[], startStatus: Status): Task[] {
    const tasksArrayLength = tasks.length;
    if (tasksArrayLength === 0) {
        return tasks;
    }
    const completedTask = tasks[tasksArrayLength - 1];
    const endStatus = completedTask.status;

    const ocTrigger = ' 🏁 ';
    const taskString = completedTask.description;

    if (!taskString.includes(ocTrigger) || endStatus.type !== StatusType.DONE || endStatus.type === startStatus.type) {
        return tasks;
    }

    if (taskString.includes('🏁 Delete')) {
        return tasks.filter((task) => task !== completedTask);
    }
    // const errorMessage = 'Unknown "On Completion" action: ' + ocAction;
    const errorMessage = 'Unknown "On Completion" action';
    const console = Console;
    console.log(errorMessage);
    return tasks;
    // const hint = '\nClick here to clear';
    // const noticeMessage = errorMessage + hint;
    // new Notice(noticeMessage, 0);
    // console.log('Uh-oh -- we should never actually get here...  :( ');
    // throw new Error('Something went wrong');
}

export function applyStatusAndOnCompletionAction(task: Task, newStatus: Status) {
    const tasks = task.handleNewStatus(newStatus);
    const startStatus = task.status;
    return handleOnCompletion(tasks, startStatus);
}
