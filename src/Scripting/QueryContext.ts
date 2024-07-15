import type { Task } from '../Task/Task';
import type { TasksFile } from './TasksFile';

/**
 * This interface is part of the implementation of placeholders and scripting.
 *
 * - Use {@link makeQueryContext} to make a {@link QueryContext}.
 * - Or more commonly, if you have a {@link SearchInfo}, use {@link SearchInfo.queryContext}
 *
 * QueryContext is a 'view' to pass in to {@link expandPlaceholders} and
 * to various methods of {@link TaskExpression}.
 *
 * It provides the following:
 * - `queryContext.query.file` - where `query.file` is a {@link TasksFile} object.
 *    So it supplies `query.file.path`, `query.file.folder`.
 *
 * @see SearchInfo
 */
export interface QueryContext {
    query: {
        file: TasksFile;
        allTasks: Readonly<Task[]>;
    };
}

/**
 * Create a {@link QueryContext} to represent a query in note at the given path in the {@link TasksFile}.
 * @param tasksFile
 *
 * @see SearchInfo.queryContext
 * @see makeQueryContextWithTasks
 */
export function makeQueryContext(tasksFile: TasksFile): QueryContext {
    return makeQueryContextWithTasks(tasksFile, []);
}

export function makeQueryContextWithTasks(tasksFile: TasksFile, allTasks: Readonly<Task[]>): QueryContext {
    return {
        query: {
            file: tasksFile,
            allTasks: allTasks,
        },
    };
}
