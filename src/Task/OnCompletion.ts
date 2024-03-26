import { StatusType } from '../Statuses/StatusConfiguration';
import type { Task } from './Task';

export function handleOnCompletion(task: Task, tasks: Task[]): Task[] {
    const tasksArrayLength = tasks.length;
    if (tasksArrayLength === 0) {
        return tasks;
    }
    const startStatus = task.status;

    const changedStatusTask = tasks[tasksArrayLength - 1];
    const endStatus = changedStatusTask.status;

    const ocTrigger = ' 🏁 ';
    const taskString = changedStatusTask.description;

    if (!taskString.includes(ocTrigger) || endStatus.type !== StatusType.DONE || endStatus.type === startStatus.type) {
        return tasks;
    }

    // experimentally copy completed task instance to archive.md in vault root

    function returnWithoutCompletedInstance() {
        return tasks.filter((task) => task !== changedStatusTask);
    }

    if (taskString.includes('🏁 Delete')) {
        return returnWithoutCompletedInstance();
    }
    // const errorMessage = 'Unknown "On Completion" action: ' + ocAction;
    const errorMessage = 'Unknown "On Completion" action';
    console.log(errorMessage);
    return tasks;
    // const hint = '\nClick here to clear';
    // const noticeMessage = errorMessage + hint;
    // new Notice(noticeMessage, 0);
    // console.log('Uh-oh -- we should never actually get here...  :( ');
    // throw new Error('Something went wrong');
}

// your getting your current code finalised (such as moving the functions out of test files)
// and put in to a new PR,
// which I can then review,
// and we can hopefully get merged before next week....
