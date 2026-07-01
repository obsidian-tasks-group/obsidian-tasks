import { Query } from '../Query/Query';
import type { Task } from '../Task/Task';
import type { TaskV1 } from './TasksApiV2';
import { taskToTaskV1 } from './TaskV1';

/**
 * Runs a Tasks query against the supplied internal tasks.
 *
 * @param querySource The Tasks query instructions to run
 * @param tasks The internal tasks to query
 * @returns Matching tasks as public {@link TaskV1} objects
 */
export const queryTasks = (querySource: string, tasks: Task[]): TaskV1[] => {
    const query = new Query(querySource);
    if (query.error !== undefined) {
        throw new Error(query.error);
    }

    const result = query.applyQueryToTasks(tasks);
    if (result.searchErrorMessage !== undefined) {
        throw new Error(result.searchErrorMessage);
    }

    return [...new Set(result.groups.flatMap((group) => group.tasks))].map(taskToTaskV1);
};
