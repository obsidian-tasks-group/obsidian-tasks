import { Task } from '../src/Task';

export function fromLine({
    line,
    path = '',
    precedingHeader = '',
}: {
    line: string;
    path?: string;
    precedingHeader?: string | null;
}) {
    return Task.fromLine(line, path, 0, 0, precedingHeader)!;
}

export function createTasksFromMarkdown(
    tasksAsMarkdown: string,
    path: string,
    precedingHeader: string,
): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    for (const line of taskLines) {
        const task = Task.fromLine(line, path, 0, 0, precedingHeader);
        if (task) {
            tasks.push(task);
        }
    }
    return tasks;
}
