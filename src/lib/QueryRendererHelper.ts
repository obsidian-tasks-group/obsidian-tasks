import { GlobalFilter } from '../Config/GlobalFilter';
import { Query } from '../Query/Query';
import { GlobalQuery } from '../Config/GlobalQuery';

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
 * @returns {string}
 */
export function explainResults(source: string): string {
    let result = '';

    if (!GlobalFilter.isEmpty()) {
        result += `Only tasks containing the global filter '${GlobalFilter.get()}'.\n\n`;
    }

    const tasksBlockQuery = new Query({ source });

    if (!tasksBlockQuery.ignoreGlobalQuery) {
        if (!GlobalQuery.isEmpty()) {
            result += `Explanation of the global query:\n\n${GlobalQuery.explainQuery()}\n`;
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
 * @returns {Query} The query to execute
 */
export function getQueryForQueryRenderer(source: string): Query {
    const tasksBlockQuery = new Query({ source });

    if (tasksBlockQuery.ignoreGlobalQuery) {
        return tasksBlockQuery;
    }

    const globalQuery = GlobalQuery.getInstance().new_query();
    return globalQuery.append(tasksBlockQuery);
}
