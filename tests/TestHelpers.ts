import { Task } from '../src/Task';

export function createTasksFromMarkdown(
    tasksAsMarkdown: string,
    path: string,
    precedingHeader: string,
): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    for (const line of taskLines) {
        const task = Task.fromLine({
            line: line,
            path: path,
            precedingHeader: precedingHeader,
            sectionIndex: 0,
            sectionStart: 0,
        });
        if (task) {
            tasks.push(task);
        }
    }
    return tasks;
}
