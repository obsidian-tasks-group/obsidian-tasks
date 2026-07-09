export const queryViewModes = ['list', 'columns'] as const;
export type QueryViewMode = (typeof queryViewModes)[number];

export class ViewLayoutOptions {
    viewMode: QueryViewMode = 'list';
}
export function parseQueryViewMode(viewLayoutOptions: ViewLayoutOptions, viewMode: string): boolean {
    if (viewMode === 'list') {
        viewLayoutOptions.viewMode = 'list';
        return true;
    }

    if (viewMode === 'columns') {
        viewLayoutOptions.viewMode = 'columns';
        return true;
    }

    return false;
}
