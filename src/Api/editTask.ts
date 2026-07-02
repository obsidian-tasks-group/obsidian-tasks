import type { App } from 'obsidian';
import { TasksFile } from '../Scripting/TasksFile';
import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';
import { taskToTaskV1, taskWithTaskV1Data } from './TaskV1';
import type { TaskV1 } from './TasksApiV2';

const splitFileContent = (content: string): string[] => {
    return content === '' ? [] : content.split('\n');
};

const lineNumberForTask = (task: Task, fileLines: string[]): number => {
    const originalLineNumber = task.lineNumber;
    if (originalLineNumber >= 0 && originalLineNumber < fileLines.length) {
        if (fileLines[originalLineNumber] === task.originalMarkdown) {
            return originalLineNumber;
        }
    }

    const matchingLineNumbers = fileLines
        .map((line, lineNumber) => ({ line, lineNumber }))
        .filter(({ line }) => line === task.originalMarkdown)
        .map(({ lineNumber }) => lineNumber);

    if (matchingLineNumbers.length === 1) {
        return matchingLineNumbers[0];
    }

    throw new Error(`TasksApiV2.editTask could not find task '${task.id}' in '${task.path}'.`);
};

const taskAtLine = (task: Task, lineNumber: number): Task => {
    return new Task({
        ...task,
        taskLocation: new TaskLocation(new TasksFile(task.path), lineNumber, lineNumber, 0, null),
        originalMarkdown: task.toFileLineString(),
    });
};

/**
 * Edits an existing task by public task ID.
 *
 * @param app The Obsidian app, used to read and modify the task's vault file
 * @param tasks All current internal tasks, used to locate the task ID
 * @param taskId The non-empty task ID to edit
 * @param taskData Public task fields to apply to the existing task
 * @returns A promise that contains the edited task as a public {@link TaskV1} object
 */
export const editTask = async (app: App, tasks: Task[], taskId: string, taskData: Partial<TaskV1>): Promise<TaskV1> => {
    if (taskId === '') {
        throw new Error('TasksApiV2.editTask requires a non-empty taskId.');
    }

    const matchingTasks = tasks.filter((task) => task.id === taskId);
    if (matchingTasks.length === 0) {
        throw new Error(`TasksApiV2.editTask could not find task '${taskId}'.`);
    }
    if (matchingTasks.length > 1) {
        throw new Error(`TasksApiV2.editTask found multiple tasks with id '${taskId}'.`);
    }

    const originalTask = matchingTasks[0];
    const file = app.vault.getFileByPath(originalTask.path);
    if (file === null) {
        throw new Error(`TasksApiV2.editTask could not find file '${originalTask.path}'.`);
    }

    const updatedTask = taskWithTaskV1Data(originalTask, taskData);
    const fileLines = splitFileContent(await app.vault.read(file));
    const lineNumber = lineNumberForTask(originalTask, fileLines);
    const updatedTaskAtLine = taskAtLine(updatedTask, lineNumber);
    const updatedFileLines = [
        ...fileLines.slice(0, lineNumber),
        updatedTaskAtLine.toFileLineString(),
        ...fileLines.slice(lineNumber + 1),
    ];

    await app.vault.modify(file, updatedFileLines.join('\n'));

    return taskToTaskV1(updatedTaskAtLine);
};
