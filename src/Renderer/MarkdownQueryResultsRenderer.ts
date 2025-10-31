import type { IQuery } from '../IQuery';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { State } from '../Obsidian/Cache';
import { MarkdownQueryResultsVisitor } from './MarkdownQueryResultsVisitor';
import { QueryResultsRendererBase } from './QueryResultsRendererBase';
import type { QueryResultsVisitor } from './QueryResultsVisitor';

/**
 * Markdown renderer - outputs plain text markdown.
 *
 * Simple, clean API with no Obsidian dependencies.
 *
 * Usage:
 * ```typescript
 * const renderer = new MarkdownQueryResultsRenderer(source, tasksFile, query);
 * await renderer.renderQuery(State.Warm, tasks);
 * const markdown = renderer.getMarkdown();
 * ```
 */
export class MarkdownQueryResultsRenderer extends QueryResultsRendererBase {
    private visitor: MarkdownQueryResultsVisitor | null = null;
    private errorMessage: string | null = null;

    constructor(source: string, tasksFile: TasksFile, query: IQuery) {
        super(source, tasksFile, query);
    }

    public rereadQueryFromFile(): void {
        // Markdown renderer doesn't recreate the query - it's passed in constructor
        // If needed, subclasses can override
    }

    protected createVisitor(): QueryResultsVisitor {
        if (!this.visitor) {
            this.visitor = new MarkdownQueryResultsVisitor();
        }
        return this.visitor;
    }

    protected renderError(errorMessage: string): void {
        this.errorMessage = errorMessage;
    }

    protected renderLoading(): void {
        // No-op for markdown
    }

    protected renderExplanation(): void {
        // Could add explanation as markdown comment if needed
    }

    protected beforeResults(_queryResult: QueryResult): void {
        // No-op for markdown
    }

    protected afterResults(_queryResult: QueryResult): void {
        // No-op for markdown
    }

    /**
     * Get the rendered markdown output.
     */
    public getMarkdown(): string {
        if (this.errorMessage) {
            return `Error: ${this.errorMessage}\n`;
        }
        return this.visitor?.getMarkdown() ?? '';
    }

    /**
     * Reset the output for re-rendering.
     */
    public reset(): void {
        this.visitor?.reset();
        this.errorMessage = null;
    }

    /**
     * Convenience method to render and get markdown in one call.
     */
    public async renderToMarkdown(tasks: Task[]): Promise<string> {
        this.reset();
        await this.renderQuery(State.Warm, tasks);
        return this.getMarkdown();
    }
}
