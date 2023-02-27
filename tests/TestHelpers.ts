import { Task } from '../src/Task';
import { TaskLocation } from '../src/TaskLocation';

export function fromLine({
    line,
    path = '',
    precedingHeader = '',
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
