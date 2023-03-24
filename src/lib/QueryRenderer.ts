import type { IQuery } from '../IQuery';
import { getGlobalQuery } from '../Config/Settings';
import { GlobalFilter } from '../Config/GlobalFilter';

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

    const globalQuery: IQuery = getGlobalQuery();

    if (globalQuery.source.trim() !== '') {
        result += `Explanation of the global query:\n\n${globalQuery.explainQuery()}\n`;
    }

    result += `Explanation of this Tasks code block query:\n\n${new Query({ source }).explainQuery()}`;

    return result;
}
