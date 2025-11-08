import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { QueryResult } from '../Query/QueryResult';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { QueryResultsRendererBase, type QueryResultsRendererGetters } from './QueryResultsRendererBase';

export class MarkdownQueryResultsRenderer extends QueryResultsRendererBase {
    private _markdown: string = '';

    constructor(getters: QueryResultsRendererGetters) {
        super(getters);
    }

    get markdown(): string {
        return this._markdown;
    }

    protected renderSearchResultsHeader(_queryResult: QueryResult): void {}

    protected renderSearchResultsFooter(_queryResult: QueryResult): void {}

    protected renderLoadingMessage(): void {}

    protected renderExplanation(_explanation: string | null): void {}

    protected renderErrorMessage(_errorMessage: string): void {}

    protected endTaskList(): void {}

    protected beginTaskList(): void {}

    protected beginListItem(): void {}

    protected addTask(_task: Task, _taskIndex: number): Promise<void> {
        this._markdown += _task.originalMarkdown;
        return Promise.resolve();
    }

    protected addListItem(_listItem: ListItem, _listItemIndex: number): Promise<void> {
        return Promise.resolve();
    }

    protected addGroupHeading(_group: GroupDisplayHeading): Promise<void> {
        return Promise.resolve();
    }
}
