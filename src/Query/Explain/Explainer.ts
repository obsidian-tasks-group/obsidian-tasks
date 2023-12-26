import { getSettings } from '../../Config/Settings';
import type { Query } from '../Query';

export class Explainer {
    protected explainQueryImpl(query: Query) {
        let result = '';
        if (query.error !== undefined) {
            result += query.explainError(query);
            return result;
        }

        result += query.explainFilters(query);
        result += query.explainGroups(query);
        result += query.explainQueryLimits(query);
        result += query.explainDebugSettings();

        return result;
    }

    private explainError(query: Query) {
        let result = '';
        result += 'Query has an error:\n';
        result += query.error + '\n';
        return result;
    }

    public explainFilters(query: Query) {
        let result = '';
        const numberOfFilters = query.filters.length;
        if (numberOfFilters === 0) {
            result += 'No filters supplied. All tasks will match the query.';
        } else {
            for (let i = 0; i < numberOfFilters; i++) {
                if (i > 0) result += '\n';
                result += query.filters[i].explainFilterIndented('');
            }
        }
        return result;
    }

    private explainGroups(query: Query) {
        let result = '\n';
        const numberOfGroups = query.grouping.length;
        if (numberOfGroups === 0) {
            result += 'No grouping instructions supplied.\n';
        } else {
            for (let i = 0; i < numberOfGroups; i++) {
                if (i > 0) result += '\n';
                result += query.grouping[i].instruction;
            }
        }
        return result;
    }

    private explainQueryLimits(query: Query) {
        let result = '';

        function getPluralisedText(limit: number) {
            let text = `\n\nAt most ${limit} task`;
            if (limit !== 1) {
                text += 's';
            }
            return text;
        }

        if (query.limit !== undefined) {
            result += getPluralisedText(query.limit);
            result += '.\n';
        }

        if (query.taskGroupLimit !== undefined) {
            result += getPluralisedText(query.taskGroupLimit);
            result += ' per group (if any "group by" options are supplied).\n';
        }
        return result;
    }

    private explainDebugSettings() {
        let result = '';
        const { debugSettings } = getSettings();
        if (debugSettings.ignoreSortInstructions) {
            result +=
                "\n\nNOTE: All sort instructions, including default sort order, are disabled, due to 'ignoreSortInstructions' setting.";
        }
        return result;
    }
}
