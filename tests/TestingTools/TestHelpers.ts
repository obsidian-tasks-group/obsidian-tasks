import { TasksFile } from '../../src/Scripting/TasksFile';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';

/**
 * @see fromLines
 * @see toLine
 */
export function fromLine({
    line,
    path = '',
    precedingHeader = null,
}: {
    line: string;
    path?: string;
    precedingHeader?: string | null;
}) {
    return Task.fromLine({
        line,
        taskLocation: new TaskLocation(new TasksFile(path), 0, 0, 0, precedingHeader),
        fallbackDate: null,
    })!;
}

/**
 * @see fromLine
 * @see createTasksFromMarkdown
 * @see toLines
 */
export function fromLines({
    lines,
    path = '',
    precedingHeader = null,
}: {
    lines: string[];
    path?: string;
    precedingHeader?: string | null;
}): Task[] {
    return lines.map((line) => fromLine({ line, path, precedingHeader }));
}

/**
 * @see toLines
 * @see fromLine
 */
export function toLine(task: Task) {
    return task.toFileLineString();
}

/**
 * @see toLine
 * @see fromLines
 * @see toMarkdown
 */
export function toLines(tasks: Task[]) {
    return tasks.map((task) => toLine(task));
}

/**
 * @see toLines
 */
export function toMarkdown(tasks: Task[]) {
    return toLines(tasks).join('\n');
}

/**
 * @see fromLines
 */
export function createTasksFromMarkdown(tasksAsMarkdown: string, path: string, precedingHeader: string): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    for (const line of taskLines) {
        const task = Task.fromLine({
            line: line,
            taskLocation: new TaskLocation(new TasksFile(path), 0, 0, 0, precedingHeader),
            fallbackDate: null,
        });
        if (task) {
            tasks.push(task);
        }
    }
    return tasks;
}
