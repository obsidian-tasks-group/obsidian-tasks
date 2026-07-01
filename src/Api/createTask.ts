import type { App } from 'obsidian';
import { TasksFile } from '../Scripting/TasksFile';
import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import { taskFromTaskV1, taskToTaskV1 } from './TaskV1';
import type { TaskCreationDestinationV1, TaskV1 } from './TasksApiV2';

const splitFileContent = (content: string): string[] => {
    return content === '' ? [] : content.split('\n');
};

const listItemIndentation = (line: string): number | undefined => {
    const listItemMatch = line.match(TaskRegularExpressions.listItemRegex);
    return listItemMatch === null ? undefined : listItemMatch[1].length;
};

const lineAfterTaskListBlock = (fileLines: string[], taskLineNumber: number): number => {
    const taskIndentation = Task.extractTaskComponents(fileLines[taskLineNumber])?.indentation.length ?? 0;
    let lineNumber = taskLineNumber + 1;

    while (lineNumber < fileLines.length) {
        const childIndentation = listItemIndentation(fileLines[lineNumber]);
        if (childIndentation === undefined || childIndentation <= taskIndentation) {
            break;
        }

        lineNumber++;
    }

    return lineNumber;
};

const lineAfterLastTaskListBlock = (fileLines: string[]): number | undefined => {
    for (let lineNumber = fileLines.length - 1; lineNumber >= 0; lineNumber--) {
        if (Task.extractTaskComponents(fileLines[lineNumber]) !== null) {
            return lineAfterTaskListBlock(fileLines, lineNumber);
        }
    }

    return undefined;
};

const insertionLine = (destination: TaskCreationDestinationV1, fileLines: string[]): number => {
    if (destination.placement === 'append') {
        return fileLines.length;
    }

    if (destination.line === undefined) {
        return lineAfterLastTaskListBlock(fileLines) ?? fileLines.length;
    }

    if (destination.line < 0 || destination.line >= fileLines.length) {
        throw new Error(`TasksApiV2.createTask line ${destination.line} is outside '${destination.path}'.`);
    }

    switch (destination.placement ?? 'after') {
        case 'before':
            return destination.line;
        case 'after':
            return destination.line + 1;
        case 'replace':
            return destination.line;
    }
};

const writeTaskLine = (
    fileLines: string[],
    lineNumber: number,
    placement: TaskCreationDestinationV1['placement'],
    taskLine: string,
) => {
    if (placement === 'replace') {
        return [...fileLines.slice(0, lineNumber), taskLine, ...fileLines.slice(lineNumber + 1)];
    }

    return [...fileLines.slice(0, lineNumber), taskLine, ...fileLines.slice(lineNumber)];
};

const taskAtLine = (task: Task, path: string, lineNumber: number): Task => {
    const originalMarkdown = task.toFileLineString();
    return new Task({
        ...task,
        taskLocation: new TaskLocation(new TasksFile(path), lineNumber, lineNumber, 0, null),
        originalMarkdown,
    });
};

/**
 * Creates a task in an existing Markdown file.
 *
 * @param app The Obsidian app, used to read and modify the target vault file
 * @param destination The file and optional line placement for the new task
 * @param description The task description to use unless overridden by taskData.description
 * @param taskData Optional public task fields that override creation defaults
 * @returns A promise that contains the created task as a public {@link TaskV1} object
 */
export const createTask = async (
    app: App,
    destination: TaskCreationDestinationV1,
    description: string,
    taskData?: Partial<TaskV1>,
): Promise<TaskV1> => {
    const file = app.vault.getFileByPath(destination.path);
    if (file === null) {
        throw new Error(`TasksApiV2.createTask could not find file '${destination.path}'.`);
    }

    const task = taskFromTaskV1({
        description,
        path: destination.path,
        taskData,
    });
    const taskLine = task.toFileLineString();
    const fileLines = splitFileContent(await app.vault.read(file));
    const lineNumber = insertionLine(destination, fileLines);
    const updatedFileLines = writeTaskLine(fileLines, lineNumber, destination.placement, taskLine);

    await app.vault.modify(file, updatedFileLines.join('\n'));

    return taskToTaskV1(taskAtLine(task, destination.path, lineNumber));
};
