export const queryViewModes = ['list', 'columns'] as const;
export type QueryViewMode = (typeof queryViewModes)[number];

export type ParseViewLayoutOptionResult = { success: true } | { success: false; error: string };

export class ViewLayoutOptions {
    viewMode: QueryViewMode = 'list';
}
export function parseQueryViewMode(
    viewLayoutOptions: ViewLayoutOptions,
    viewMode: string,
): ParseViewLayoutOptionResult {
    if (viewMode.toLowerCase() === 'list') {
        viewLayoutOptions.viewMode = 'list';
        return { success: true };
    }

    if (viewMode.toLowerCase() === 'columns') {
        viewLayoutOptions.viewMode = 'columns';
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
