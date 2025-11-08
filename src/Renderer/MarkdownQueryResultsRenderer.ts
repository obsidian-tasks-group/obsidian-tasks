import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { QueryResult } from '../Query/QueryResult';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { QueryResultsRendererBase, type QueryResultsRendererGetters } from './QueryResultsRendererBase';

export class MarkdownQueryResultsRenderer extends QueryResultsRendererBase {
    private readonly markdownLines: string[] = [];
    private taskIndentationLevel = 0;

    constructor(getters: QueryResultsRendererGetters) {
        super(getters);
    }

    get markdown(): string {
        return this.markdownLines.join('\n');
    }

    protected beginRender() {
        this.markdownLines.length = 0;
        this.taskIndentationLevel = 0;
    }

    protected renderSearchResultsHeader(_queryResult: QueryResult): void {}

    protected renderSearchResultsFooter(_queryResult: QueryResult): void {}

    protected renderLoadingMessage(): void {}

    protected renderExplanation(_explanation: string | null): void {}

    protected renderErrorMessage(_errorMessage: string): void {}

    protected beginTaskList(): void {
        this.taskIndentationLevel += 1;
    }

    protected endTaskList(): void {
        this.taskIndentationLevel -= 1;

        const isOutermostList = this.taskIndentationLevel === 0;
        if (isOutermostList) {
            this.addEmptyLine();
        }
    }

    private addEmptyLine() {
        this.markdownLines.push('');
    }

    protected beginListItem(): void {}

    protected addTask(task: Task, _taskIndex: number): Promise<void> {
        const indentationLevel = Math.max(0, this.taskIndentationLevel - 1);
        const indentation = '    '.repeat(indentationLevel);
        this.markdownLines.push(`${indentation}${task.originalMarkdown.trim()}`);
        return Promise.resolve();
    }

    protected addListItem(_listItem: ListItem, _listItemIndex: number): Promise<void> {
        return Promise.resolve();
    }

    protected addGroupHeading(group: GroupDisplayHeading): Promise<void> {
        const headingPrefix = '#'.repeat(Math.min(4 + group.nestingLevel, 6));
        this.markdownLines.push(`${headingPrefix} ${group.displayName}`);
        this.addEmptyLine();
        return Promise.resolve();
    }
}
