import { parseGrouper } from '../Query/FilterParser';
import type { Grouper } from '../Query/Group/Grouper';

export const queryViewModes = ['list', 'columns'] as const;
export type QueryViewMode = (typeof queryViewModes)[number];

export type ParseViewLayoutOptionResult = { success: true } | { success: false; error: string };

export class ViewLayoutOptions {
    viewMode: QueryViewMode = 'list';
    grouper: Grouper | null = null;
}

export function parseQueryViewMode(
    viewLayoutOptions: ViewLayoutOptions,
    viewMode: string,
): ParseViewLayoutOptionResult {
    const { mode, remainder } = splitViewInstruction(viewMode);

    if (mode === 'list') {
        return parseListViewMode(viewLayoutOptions, viewMode, remainder);
    }

    if (mode === 'columns') {
        return parseColumnsViewMode(viewLayoutOptions, remainder);
    }

    return unknownViewModeError(viewMode);
}

function splitViewInstruction(viewMode: string): { mode: string; remainder: string } {
    const trimmedViewMode = viewMode.trim();
    const firstSpace = trimmedViewMode.indexOf(' ');

    if (firstSpace === -1) {
        return {
            mode: trimmedViewMode.toLowerCase(),
            remainder: '',
        };
    }

    return {
        mode: trimmedViewMode.slice(0, firstSpace).toLowerCase(),
        remainder: trimmedViewMode.slice(firstSpace + 1).trim(),
    };
}

function parseListViewMode(
    viewLayoutOptions: ViewLayoutOptions,
    viewMode: string,
    remainder: string,
): ParseViewLayoutOptionResult {
    if (remainder !== '') {
        return unknownViewModeError(viewMode);
    }

    viewLayoutOptions.viewMode = 'list';
    viewLayoutOptions.grouper = null;
    return { success: true };
}

function parseColumnsViewMode(viewLayoutOptions: ViewLayoutOptions, remainder: string): ParseViewLayoutOptionResult {
    if (remainder === '') {
        return missingColumnsGroupingError();
    }

    // Make a copy of the viewMode string, with initial columns word replaced by 'group'
    const groupInstruction = 'group ' + remainder;
    const grouper = parseGrouper(groupInstruction);

    if (grouper === null) {
        return {
            success: false,
            error: `do not understand columns grouping "${remainder}"

Columns view grouping uses the same fields as "group by".

${columnsViewExamples()}`,
        };
    }

    viewLayoutOptions.viewMode = 'columns';
    viewLayoutOptions.grouper = grouper;
    return { success: true };
}

function missingColumnsGroupingError(): ParseViewLayoutOptionResult {
    return {
        success: false,
        error: `columns view requires a grouping expression

${columnsViewExamples()}`,
    };
}

function columnsViewExamples(): string {
    return `For example:
    view columns by priority
    view columns by root
    view columns by status.type reverse`;
}

function unknownViewModeError(viewMode: string): ParseViewLayoutOptionResult {
    return {
        success: false,
        error: `do not understand view mode "${viewMode}"

The available view modes are:
${queryViewModes.map((mode) => `    ${mode}`).join('\n')}

For example:
    view ${queryViewModes[0]}`,
    };
}
