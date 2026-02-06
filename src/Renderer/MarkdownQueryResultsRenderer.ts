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

    protected beginRender(): void {
        this.markdownLines.length = 0;
        this.taskIndentationLevel = 0;
    }

    protected renderSearchResultsHeader(_queryResult: QueryResult): void {
        return;
    }

    protected renderSearchResultsFooter(_queryResult: QueryResult): void {
        return;
    }

    protected renderLoadingMessage(): void {
        return;
    }

    protected renderExplanation(explanation: string | null): void {
        if (explanation) {
            this.markdownLines.push(explanation);
        }
    }

    protected renderErrorMessage(_errorMessage: string): void {
        return;
    }

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

    protected beginListItem(): void {
        return;
    }

    protected addTask(task: Task, _taskIndex: number): Promise<void> {
        this.markdownLines.push(this.formatTask(task));
        return Promise.resolve();
    }

    /**
     * This is a duplicate of Task.toFileLineString() because tasks rendered in search results
     * do not necessarily have the same indentation and list markers as the source task lines.
     *
     * @param task
     */
    private formatTask(task: Task): string {
        return `${this.listItemIndentation()}- [${task.status.symbol}] ${task.toString()}`;
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
        const statusCharacterToString = listItem.statusCharacter ? `[${listItem.statusCharacter}] ` : '';
        return `${this.listItemIndentation()}- ${statusCharacterToString}${listItem.description}`;
    }

    private listItemIndentation() {
        const indentationLevel = Math.max(0, this.taskIndentationLevel - 1);
        return '    '.repeat(indentationLevel);
    }

    protected addGroupHeading(group: GroupDisplayHeading): Promise<void> {
        const headingPrefix = '#'.repeat(Math.min(4 + group.nestingLevel, 6));
        this.markdownLines.push(`${headingPrefix} ${group.displayName}`);
        this.addEmptyLine();
        return Promise.resolve();
    }
}
