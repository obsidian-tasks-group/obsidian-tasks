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
    if (viewMode.toLowerCase() === 'list') {
        viewLayoutOptions.viewMode = 'list';
        return { success: true };
    }

    if (viewMode.toLowerCase().startsWith('columns')) {
        viewLayoutOptions.viewMode = 'columns';
        // Make a copy of the viewMode string, with initial columns word replaced by 'group'
        const groupInstruction = viewMode.replace(/^columns/, 'group');
        viewLayoutOptions.grouper = parseGrouper(groupInstruction);
        return { success: true };
    }

    return unknownViewModeError(viewMode);
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
