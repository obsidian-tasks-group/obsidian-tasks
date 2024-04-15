import { TFile } from 'obsidian';

import { StatusType } from '../Statuses/StatusConfiguration';
import { appendToEndOfFile, appendToListWithinFile } from '../lib/FileWriter';
import type { Task } from './Task';

function returnWithoutCompletedInstance(tasks: Task[], changedStatusTask: Task) {
    return tasks.filter((task) => task !== changedStatusTask);
}

async function updateFileContent(filePath: string, fileContentUpdater: (data: string) => string): Promise<void> {
    let file = app.vault.getAbstractFileByPath(filePath);
    if (file === null) {
        // Try creating the file.
        // This probably depends on any parent directories already existing:
        // TODO If filePath is not in root, if necessary, create intermediate directories.
        file = await app.vault.create(filePath, '');
    }

    if (file instanceof TFile) {
        await app.vault.process(file, (data) => {
            return fileContentUpdater(data);
        });
    } else {
        // If we were not able to save the done task, we would like to be able to retain everything.
        // TODO There is currently no way to communicate this failure back to callers,
        //      and so if we reach here, the completed task gets unintentionally discarded.
        console.log(`Something went wrong - cannot read or create ${filePath}`);
    }
}

function updateFileContentEventually(filePath: string, fileContentUpdater: (data: string) => string): void {
    updateFileContent(filePath, fileContentUpdater).then(() => {});
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

    if (taskString.includes('🏁 Delete')) {
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
    }

    // trim leading spaces to prevent misinterpretation of indented tasks moved to new contexts;
    const textToWrite = changedStatusTask.toFileLineString().trimStart();

    if (taskString.includes('🏁 ToLogFile')) {
        //  append completed task to end of list under specified heading of separate, specified note file
        const filePath = 'Manual Testing/On Completion/Archive.md';
        updateFileContentEventually(filePath, (data: string) => {
            return appendToEndOfFile(data, textToWrite);
        });
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
    }

    if (taskString.includes('🏁 ToLogList')) {
        //  move completed task to end of list with specified heading within note in which it originated
        const filePath = changedStatusTask.path;
        updateFileContentEventually(filePath, (data: string) => {
            return appendToListWithinFile(data, '## Archived Tasks - Prepended', textToWrite);
        });
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
    }

    if (taskString.includes('🏁 EndOfList')) {
        //  move completed task to end of list in which it originated
        const filePath = changedStatusTask.path;
        updateFileContentEventually(filePath, (data: string) => {
            // TODO The function name says that it writes to the end of the list, but it writes to the start.
            // TODO It does not create the heading if it was missing.
            return writeLineToListEnd(data, '## Archived Tasks - Appended', textToWrite);
        });
        return returnWithoutCompletedInstance(tasks, changedStatusTask);
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

export function writeLineToListEnd(initialFileContent: string, targetListHeading: string, textToAppend: string) {
    if (textToAppend.length === 0) {
        return initialFileContent;
    }
    if (targetListHeading === '') {
        throw Error('Cannot move line to list as empty target list heading was supplied');
    }
    const NEWLINE = '\n';
    const TASK_REGEX = new RegExp('^( *(- [.])).*');
    const linesArray = initialFileContent.split('\n');
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
