import type { GlobalQuery } from '../Config/GlobalQuery';
import { getQueryForQueryRenderer } from '../Query/QueryRendererHelper';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { type ReadOnlyTask, taskToReadOnlyTask } from '../Task/ReadOnlyTask';

/**
 * Pure function to execute a Tasks query against an array of tasks.
 *
 * Underlying implementation for {@link TasksApiV1.queryTasks}.
 * See {@link TasksApiV1.queryTasks} for ordering, grouping and placeholder semantics.
 *
 * @param querySource The Tasks query string (e.g. "not done\ndue before tomorrow").
 * @param allTasks Array of tasks to query against.
 * @param globalQuery Global query instance to use.
 * @param tasksFile Optional file containing the query, used to resolve Placeholders (e.g. {{query.file.folder}}) and properties.
 * @returns Array of unique matching tasks as frozen ReadOnlyTask objects in the order their groups appear when rendered, deduplicated at first occurrence.
 * @throws Error if `querySource` is not a string, if the query syntax is invalid, or if placeholders cannot be resolved.
 */
export function queryTasks(
    querySource: string,
    allTasks: Task[],
    globalQuery: GlobalQuery,
    tasksFile?: TasksFile,
): ReadOnlyTask[] {
    if (typeof querySource !== 'string') {
        throw new Error('queryTasks: querySource must be a string');
    }

    const query = getQueryForQueryRenderer(querySource, globalQuery, tasksFile);

    if (query.error !== undefined) {
        throw new Error(query.error);
    }

    const result = query.applyQueryToTasks(allTasks);

    if (result.searchErrorMessage !== undefined) {
        throw new Error(result.searchErrorMessage);
    }

    // Set<Task> deduplication relies on TaskGroups preserving identical Task instance references across groups.
    return [...new Set(result.groups.flatMap((g) => g.tasks))].map(taskToReadOnlyTask);
}
