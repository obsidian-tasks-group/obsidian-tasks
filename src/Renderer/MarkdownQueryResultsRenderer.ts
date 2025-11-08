import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { QueryResult } from '../Query/QueryResult';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { QueryResultsRendererBase, type QueryResultsRendererGetters } from './QueryResultsRendererBase';

export class MarkdownQueryResultsRenderer extends QueryResultsRendererBase {
    private readonly markdownLines: string[] = [];

    constructor(getters: QueryResultsRendererGetters) {
        super(getters);
    }

    get markdown(): string {
        return this.markdownLines.join('\n');
    }

    protected beginRender() {
        this.markdownLines.length = 0;
    }

    protected renderSearchResultsHeader(_queryResult: QueryResult): void {}

    protected renderSearchResultsFooter(_queryResult: QueryResult): void {}

    protected renderLoadingMessage(): void {}

    protected renderExplanation(_explanation: string | null): void {}

    protected renderErrorMessage(_errorMessage: string): void {}

    protected beginTaskList(): void {
        const isFirstLine = this.markdownLines.length === 0;
        if (!isFirstLine) {
            this.addEmptyLine();
        }
    }

    protected endTaskList(): void {
        this.addEmptyLine();
    }

    private addEmptyLine() {
        this.markdownLines.push('');
    }

    protected beginListItem(): void {}

    protected addTask(_task: Task, _taskIndex: number): Promise<void> {
        this.markdownLines.push(_task.originalMarkdown);
        return Promise.resolve();
    }

    protected addListItem(_listItem: ListItem, _listItemIndex: number): Promise<void> {
        return Promise.resolve();
    }

    protected addGroupHeading(group: GroupDisplayHeading): Promise<void> {
        this.markdownLines.push(`#### ${group.displayName}`);
        return Promise.resolve();
    }
}
