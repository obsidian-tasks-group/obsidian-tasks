export const queryViewModes = ['list', 'columns'] as const;
export type QueryViewMode = (typeof queryViewModes)[number];

export class ViewLayoutOptions {
    viewMode: QueryViewMode = 'list';
}
