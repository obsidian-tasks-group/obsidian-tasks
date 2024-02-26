import Console from 'console';
import type { Status } from '../Statuses/Status';
import { StatusType } from '../Statuses/StatusConfiguration';
import type { Task } from './Task';

function handleOnCompletion(tasks: Task[], startStatus: Status, endStatus: Status): Task[] {
    const tasksArrayLength = tasks.length;
    if (tasksArrayLength === 0) {
        return tasks;
    }
    const completedTask = tasks[tasksArrayLength - 1];

    const ocTrigger = ' 🏁 ';
    const taskString = completedTask.toString();

    if (!taskString.includes(ocTrigger) || endStatus.type !== StatusType.DONE || endStatus.type === startStatus.type) {
        return tasks;
    }

    if (taskString.includes(ocTrigger)) {
        const taskEnd = taskString.substring(taskString.indexOf(ocTrigger) + 4);
        const ocAction = taskEnd.substring(0, taskEnd.indexOf(' '));
        switch (ocAction) {
            case 'Delete': {
                return tasks.filter((task) => task !== completedTask);
            }
            default: {
                const errorMessage = 'Unknown "On Completion" action: ' + ocAction;
                const console = Console;
                console.log(errorMessage);
                // const hint = '\nClick here to clear';
                // const noticeMessage = errorMessage + hint;
                // new Notice(noticeMessage, 0);
                return tasks;
            }
        }
    }
    console.log('Uh-oh -- we should never actually get here...  :( ');
    throw new Error('Something went wrong');
    return tasks;
}

export function applyStatusAndOnCompletionAction(task: Task, newStatus: Status) {
    const startStatus = task.status;
    const tasks = task.handleNewStatus(newStatus);
    const endStatus = tasks[tasks.length - 1].status;
    return handleOnCompletion(tasks, startStatus, endStatus);
}
