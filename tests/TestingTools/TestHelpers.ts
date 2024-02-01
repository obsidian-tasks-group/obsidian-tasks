import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';

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
        taskLocation: new TaskLocation(path, 0, 0, 0, precedingHeader),
        fallbackDate: null,
    })!;
}

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

export function toLine(task: Task) {
    return task.toFileLineString();
}

export function toLines(tasks: Task[]) {
    return tasks.map((task) => toLine(task));
}

export function createTasksFromMarkdown(tasksAsMarkdown: string, path: string, precedingHeader: string): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    for (const line of taskLines) {
        const task = Task.fromLine({
            line: line,
            taskLocation: new TaskLocation(path, 0, 0, 0, precedingHeader),
            fallbackDate: null,
        });
        if (task) {
            tasks.push(task);
        }
    }
    return tasks;
}
