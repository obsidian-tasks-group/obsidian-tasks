import type { IQuery } from '../IQuery';
import { getGlobalQuerySource } from '../Config/Settings';
import { GlobalFilter } from '../Config/GlobalFilter';
import { Query } from '../Query/Query';

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
 * @param {string} path The location of the task block, if known
 * @returns {string}
 */
export function explainResults(source: string, path: string | undefined = undefined): string {
    let result = '';

    if (!GlobalFilter.isEmpty()) {
        result += `Only tasks containing the global filter '${GlobalFilter.get()}'.\n\n`;
    }

    const tasksBlockQuery = new Query({ source }, path);

    if (!tasksBlockQuery.ignoreGlobalQuery) {
        const globalQuery: IQuery = new Query(getGlobalQuerySource(), path);

        if (globalQuery.source.trim() !== '') {
            result += `Explanation of the global query:\n\n${globalQuery.explainQuery()}\n`;
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
 * @param {string | undefined} path The path to the file containing the query, if available.
 * @returns {Query} The query to execute
 */
export function getQueryForQueryRenderer(source: string, path: string | undefined): Query {
    const globalQuery = new Query(getGlobalQuerySource(), path);
    const tasksBlockQuery = new Query({ source }, path);

    if (tasksBlockQuery.ignoreGlobalQuery) {
        return tasksBlockQuery;
    }

    return globalQuery.append(tasksBlockQuery);
}
