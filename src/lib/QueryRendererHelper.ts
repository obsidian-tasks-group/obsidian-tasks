import type { Moment, unitOfTime } from 'moment';
import type { GlobalFilter } from '../Config/GlobalFilter';
import type { GlobalQuery } from '../Config/GlobalQuery';
import { Query } from '../Query/Query';
import { Task } from '../Task';
import { TasksDate } from '../Scripting/TasksDate';

/**
 * @summary
 * This file contains utilities used by {@link QueryRenderer} that should actually
 * be in that file. But the file {@link QueryRenderer} is in depends on dependencies
 * that aren't available during automated testing, and would make it impossible to run
 * those tests on the code that is instead housed here.
 */

/**
 * Explains a query rendered by {@link QueryRenderer}
 *
 * Specifically, returns a formatted string:
 *     * Explains whether a global filter is in use
 *     * Explains whether the global query if it's in use
 *     * Explains the query described by {@link source}
 *
 * @param {string} source The source of the task block to explain
 * @param {GlobalFilter} globalFilter The global filter. In `src/`, generally pass in {@link GlobalFilter.getInstance}
 * @param {GlobalQuery} globalQuery The global query. In `src/`, generally pass in {@link GlobalQuery.getInstance}
 * @param {string} path The location of the task block, if known
 * @returns {string}
 */
export function explainResults(
    source: string,
    globalFilter: GlobalFilter,
    globalQuery: GlobalQuery,
    path: string | undefined = undefined,
): string {
    let result = '';

    if (!globalFilter.isEmpty()) {
        result += `Only tasks containing the global filter '${globalFilter.get()}'.\n\n`;
    }

    const tasksBlockQuery = new Query(source, path);

    if (!tasksBlockQuery.ignoreGlobalQuery) {
        if (globalQuery.hasInstructions()) {
            result += `Explanation of the global query:\n\n${globalQuery.query(path).explainQuery()}\n`;
        }
    }

    result += `Explanation of this Tasks code block query:\n\n${tasksBlockQuery.explainQuery()}`;

    return result;
}

/**
 * Creates the actual query that {@link QueryRenderChild} will actually execute against the task list.
 *
 * This query is the result of joining the global query with the query in the task block
 *
 * @param {string} source The query source from the task block
 * @param globalQuery
 * @param {string | undefined} path The path to the file containing the query, if available.
 * @returns {Query} The query to execute
 */
export function getQueryForQueryRenderer(source: string, globalQuery: GlobalQuery, path: string | undefined): Query {
    const tasksBlockQuery = new Query(source, path);

    if (tasksBlockQuery.ignoreGlobalQuery) {
        return tasksBlockQuery;
    }

    return globalQuery.query(path).append(tasksBlockQuery);
}

export function getDateFieldToPostpone(task: Task) {
    const scheduledDateOrNull = task.scheduledDate ? 'scheduledDate' : null;
    const dateTypeToUpdate = task.dueDate ? 'dueDate' : scheduledDateOrNull;
    return dateTypeToUpdate;
}

export function createPostponedTask(
    task: Task,
    dateTypeToUpdate: keyof Task,
    timeUnit: unitOfTime.DurationConstructor,
    amount: number,
) {
    const dateToUpdate = task[dateTypeToUpdate] as Moment;
    const postponedDate = new TasksDate(dateToUpdate).postpone(timeUnit, amount);
    const newTasks = new Task({ ...task, [dateTypeToUpdate]: postponedDate });
    return { postponedDate, newTasks };
}
