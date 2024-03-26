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
    if (taskString.includes('🏁 ToLogFile')) {
        // pass;
        // return writebackToOriginalLine();
    }
    if (taskString.includes('🏁 ToLogList')) {
        // pass;
        // return writebackToOriginalLine();
    }
    if (taskString.includes('🏁 EndOfList')) {
        // pass;
        // return writebackToOriginalLine();
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

export function writeLineToListEnd(initialContent: string, targetListHeading: string, textToAppend: string) {
    const NEWLINE = '\n';
    const TASK_REGEX = new RegExp('^( *(- [.])).*');
    const linesArray = initialContent.split('\n');
    const headingLineNumber = linesArray.indexOf(targetListHeading);
    let thisLine = '';
    let insertionLine = headingLineNumber + 1;
    for (thisLine in linesArray.slice(insertionLine)) {
        if (thisLine.search(TASK_REGEX) > -1) {
            insertionLine += 1;
        } else break;
    }
    if (insertionLine > linesArray.length) {
        insertionLine = -1;
    }
    linesArray[insertionLine] += NEWLINE + textToAppend;
    return linesArray.join(NEWLINE);
}
