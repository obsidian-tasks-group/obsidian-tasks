import { getSettings } from '../../Config/Settings';
import type { Query } from '../Query';

export class Explainer {
    private readonly indentation: string;

    /**
     * Constructor.
     * @param indentation - the indentation to use for the output. Defaults to 'not indented'.
     */
    constructor(indentation: string = '') {
        this.indentation = indentation;
    }

    /**
     * Generate a text description of the contents of a query.
     *
     * This does not show any global filter and global query.
     * Use {@link explainResults} if you want to see any global query and global filter as well.
     */
    public explainQuery(query: Query) {
        if (query.error !== undefined) {
            return this.explainError(query);
        }

        /**
         * Each function result should:
         * - either:
         *     - be empty, if there is no information,
         * - or:
         *     - begin with a non-newline,
         *     - end with a single newline.
         */
        const results: string[] = [];
        results.push(this.explainFilters(query));
        results.push(this.explainGroups(query));
        results.push(this.explainSorters(query));
        results.push(this.explainQueryLimits(query));
        results.push(this.explainDebugSettings());

        return results.filter((explanation) => explanation !== '').join('\n');
    }

    private explainError(query: Query) {
        let result = '';
        result += 'Query has an error:\n';
        result += query.error + '\n';
        return result;
    }

    public explainFilters(query: Query) {
        if (query.filters.length === 0) {
            return this.indent('No filters supplied. All tasks will match the query.\n');
        }

        return query.filters.map((filter) => filter.explainFilterIndented(this.indentation)).join('\n');
    }

    public explainGroups(query: Query) {
        if (query.grouping.length === 0) {
            return this.indent('No grouping instructions supplied.\n');
        }

        return query.grouping.map((group) => this.indentation + group.instruction).join('\n') + '\n';
    }

    public explainSorters(query: Query) {
        if (query.sorting.length === 0) {
            return this.indent('No sorting instructions supplied.\n');
        }

        return query.sorting.map((group) => this.indentation + group.instruction).join('\n') + '\n';
    }

    public explainQueryLimits(query: Query) {
        function getPluralisedText(limit: number) {
            let text = `At most ${limit} task`;
            if (limit !== 1) {
                text += 's';
            }
            return text;
        }

        const results: string[] = [];

        if (query.limit !== undefined) {
            const result = getPluralisedText(query.limit) + '.\n';
            results.push(this.indent(result));
        }

        if (query.taskGroupLimit !== undefined) {
            const result =
                getPluralisedText(query.taskGroupLimit) + ' per group (if any "group by" options are supplied).\n';
            results.push(this.indent(result));
        }
        return results.join('\n');
    }

    private explainDebugSettings() {
        let result = '';
        const { debugSettings } = getSettings();
        if (debugSettings.ignoreSortInstructions) {
            result += this.indent(
                "NOTE: All sort instructions, including default sort order, are disabled, due to 'ignoreSortInstructions' setting.\n",
            );
        }
        return result;
    }

    private indent(description: string) {
        return this.indentation + description;
    }
}
