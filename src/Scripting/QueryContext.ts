import { getSettings } from '../Config/Settings';
import type { Task } from '../Task/Task';
import type { PresetsMap } from '../Query/Presets/Presets';
import type { TasksFile } from './TasksFile';
import { ActiveFile } from './ActiveFile';

/**
 * This interface is part of the implementation of placeholders and scripting.
 *
 * - Use {@link makeQueryContext} or {@link makeQueryContextWithTasks} to make a {@link QueryContext}.
 * - Or more commonly, if you have a {@link SearchInfo}, use {@link SearchInfo.queryContext}
 *
 * QueryContext is a 'view' to pass in to {@link expandPlaceholders} and
 * to various methods of {@link TaskExpression}.
 *
 * It provides the following:
 * - `queryContext.query.file` - where `query.file` is a {@link TasksFile} object.
 *                               So it supplies `query.file.path`, `query.file.folder`, etc.
 * - `queryContext.query.activeFile` - the {@link TasksFile} open in the main editing area,
 *                                     or undefined if there is none. See {@link ActiveFile}.
 * - `queryContext.query.allTasks` - all the {@link Task}s in the vault that match
 *                                   any global filter.
 *
 * @see SearchInfo
 */
export interface QueryContext {
    query: {
        file: TasksFile;
        activeFile: TasksFile | undefined;
        allTasks: Readonly<Task[]>;
        searchCache: Record<string, unknown>; // Added caching capability
    };
    preset: PresetsMap;
}

/**
 * Create a {@link QueryContext} to represent a query in note at the given path in the {@link TasksFile}.
 *
 * Use this function if you do not have the array of {@link Task} objects in that.
 * @param tasksFile
 *
 * @see SearchInfo.queryContext
 * @see makeQueryContextWithTasks
 */
export function makeQueryContext(tasksFile: TasksFile): QueryContext {
    return makeQueryContextWithTasks(tasksFile, []);
}

/**
 * Create a {@link QueryContext} to represent a query in note at the given path in the {@link TasksFile},
 * and the tasks in the vault.
 *
 * Use this function if you do have the array of {@link Task} objects in that.
 * @param tasksFile
 * @param allTasks
 *
 * @see SearchInfo.queryContext
 * @see makeQueryContext
 */
export function makeQueryContextWithTasks(tasksFile: TasksFile, allTasks: Readonly<Task[]>): QueryContext {
    return {
        query: {
            file: tasksFile,
            activeFile: ActiveFile.getInstance().get(),
            allTasks: allTasks,
            searchCache: {}, // Added for caching
        },
        preset: { ...getSettings().presets },
    };
}
