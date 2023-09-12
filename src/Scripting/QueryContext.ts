import { TasksFile } from './TasksFile';

/**
 * This interface is part of the implementation of placeholders.
 * Use {@link makeQueryContext} to make a QueryContext.
 *
 * QueryContext is a 'view' to pass in to {@link expandPlaceholders}.
 *
 * It provides the following:
 * `queryContext.query.file` - where query.file is a {@link TasksFile} object.
 * So it supplies `query.file.path`, `query.file.folder`.
 */
export interface QueryContext {
    query: {
        file: TasksFile;
    };
}

/**
 * Create a {@link QueryContext} to represent a query in note at the give path.
 * @param path
 */
export function makeQueryContext(path: string): QueryContext {
    const tasksFile = new TasksFile(path);
    return {
        query: {
            file: tasksFile,
        },
    };
}
