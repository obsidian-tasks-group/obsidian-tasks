import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { QueryResult } from '../Query/QueryResult';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { QueryResultsRendererBase, type QueryResultsRendererGetters } from './QueryResultsRendererBase';

/**
 * @example
 *   const markdownRenderer = new MarkdownQueryResultsRenderer(getters);
 *   await markdownRenderer.renderQuery(State.Warm, allTasks);
 *   const markdown = markdownRenderer.markdown;
 *
 */
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
        this.markdownLines.push(`${indentation}${this.formatTask(task)}`);
        return Promise.resolve();
    }

    /**
     * This is a duplicate of Task.toFileLineString() because tasks rendered in search results
     * do not necessarily have the same indentation and list markers as the source task lines.
     *
     * @param task
     */
    public formatTask(task: Task): string {
        return `- [${task.status.symbol}] ${task.toString()}`;
    }

    protected addListItem(listItem: ListItem, _listItemIndex: number): Promise<void> {
        this.markdownLines.push(this.formatListItem(listItem));
        return Promise.resolve();
    }

    /**
     * This is based on ListItem.toFileLineString() because tasks rendered in search results
     * do not necessarily have the same indentation and list markers as the source lines.
     *
     * @param listItem
     */
    private formatListItem(listItem: ListItem): string {
        const indentationLevel = Math.max(0, this.taskIndentationLevel - 1);
        const indentation = '    '.repeat(indentationLevel);
        const statusCharacterToString = listItem.statusCharacter ? `[${listItem.statusCharacter}] ` : '';
        return `${indentation}- ${statusCharacterToString}${listItem.description}`;
    }

    protected addGroupHeading(group: GroupDisplayHeading): Promise<void> {
        const headingPrefix = '#'.repeat(Math.min(4 + group.nestingLevel, 6));
        this.markdownLines.push(`${headingPrefix} ${group.displayName}`);
        this.addEmptyLine();
        return Promise.resolve();
    }
}
