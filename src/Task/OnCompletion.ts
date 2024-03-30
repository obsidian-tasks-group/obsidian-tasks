import { TFile } from 'obsidian';

import { StatusType } from '../Statuses/StatusConfiguration';
import { appendToListWithinFile } from '../lib/FileWriter';
import type { Task } from './Task';

function returnWithoutCompletedInstance(tasks: Task[], changedStatusTask: Task) {
    return tasks.filter((task) => task !== changedStatusTask);
}

async function moveCompletedTaskToHeadingInFile(
    filePath: string,
    fileContentUpdater: (data: string) => string,
): Promise<void> {
    let file = app.vault.getAbstractFileByPath(filePath);
    if (file === null) {
        // Try creating the file.
        // This probably depends on any parent directories already existing:
        file = await app.vault.create(filePath, '');
    }

    if (file instanceof TFile) {
        await app.vault.process(file, (data) => {
            return fileContentUpdater(data);
        });
    } else {
        // If we were not able to save the done task, retain everything.
        console.log(`Something went wrong - cannot read or create ${filePath}`);
    }
}

function moveCompletedTaskToHeadingInFileEventually(
    filePath: string,
    fileContentUpdater: (data: string) => string,
): void {
    moveCompletedTaskToHeadingInFile(filePath, fileContentUpdater).then(() => {});
}

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

    if (taskString.includes('🏁 Delete')) {
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
    }
    if (taskString.includes('🏁 ToLogFile')) {
        // pass;
        // return writebackToOriginalLine();
    }
    if (taskString.includes('🏁 ToLogList')) {
        const filePath = 'Manual Testing/On Completion/Archive.md';
        const fileHeading = '## Archived Tasks';
        moveCompletedTaskToHeadingInFileEventually(filePath, (data: string) => {
            const textToWrite = changedStatusTask.toFileLineString();
            return appendToListWithinFile(data, fileHeading, textToWrite);
        });
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
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
