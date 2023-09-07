import { TasksFile } from '../Scripting/TasksFile';

export interface QueryContext {
    query: {
        file: TasksFile;
    };
}

export function makeQueryContext(path: string): QueryContext {
    const tasksFile = new TasksFile(path);
    return {
        query: {
            file: tasksFile,
        },
    };
}

export function makeQueryContextFromPath(path: string) {
    return makeQueryContext(path);
}
