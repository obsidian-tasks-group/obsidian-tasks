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
        viewLayoutOptions.viewMode = 'list';
        return { success: true };
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

function parseColumnsViewMode(viewLayoutOptions: ViewLayoutOptions, remainder: string): ParseViewLayoutOptionResult {
    viewLayoutOptions.viewMode = 'columns';
    // Make a copy of the viewMode string, with initial columns word replaced by 'group'
    const groupInstruction = 'group ' + remainder;
    viewLayoutOptions.grouper = parseGrouper(groupInstruction);
    return { success: true };
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
