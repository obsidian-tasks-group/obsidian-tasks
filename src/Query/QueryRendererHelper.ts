import type { GlobalFilter } from '../Config/GlobalFilter';
import type { GlobalQuery } from '../Config/GlobalQuery';
import type { OptionalTasksFile } from '../Scripting/TasksFile';
import { Query } from './Query';
import { Explainer } from './Explain/Explainer';

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
 * @param {OptionalTasksFile} tasksFile The location of the task block, if known
 * @returns {string}
 */
export function explainResults(
    source: string,
    globalFilter: GlobalFilter,
    globalQuery: GlobalQuery,
    tasksFile: OptionalTasksFile = undefined,
): string {
    let result = '';

    if (!globalFilter.isEmpty()) {
        result += `Only tasks containing the global filter '${globalFilter.get()}'.\n\n`;
    }

    const explainer = new Explainer('  ');
    const tasksBlockQuery = new Query(source, tasksFile);

    if (!tasksBlockQuery.ignoreGlobalQuery) {
        if (globalQuery.hasInstructions()) {
            const globalQueryQuery = globalQuery.query(tasksFile);
            result += `Explanation of the global query:\n\n${explainer.explainQuery(globalQueryQuery)}\n`;
        }
    }

    result += `Explanation of this Tasks code block query:\n\n${explainer.explainQuery(tasksBlockQuery)}`;

    return result;
}

/**
 * Creates the actual query that {@link QueryRenderChild} will actually execute against the task list.
 *
 * This query is the result of joining the global query with the query in the task block
 *
 * @param {string} source The query source from the task block
 * @param globalQuery
 * @param {OptionalTasksFile} tasksFile The path to the file containing the query, if available.
 * @returns {Query} The query to execute
 */
export function getQueryForQueryRenderer(
    source: string,
    globalQuery: GlobalQuery,
    tasksFile: OptionalTasksFile,
): Query {
    const tasksBlockQuery = new Query(source, tasksFile);

    if (tasksBlockQuery.ignoreGlobalQuery) {
        return tasksBlockQuery;
    }

    return globalQuery.query(tasksFile).append(tasksBlockQuery);
}
