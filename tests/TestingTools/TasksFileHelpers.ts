import { TasksFile } from '../../src/Scripting/TasksFile';

export function createTestTasksFile(path: string): TasksFile {
    return new TasksFile(path);
}
