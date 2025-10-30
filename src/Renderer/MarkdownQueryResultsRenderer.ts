/**
 * MarkdownQueryResultsRenderer
 *
 * A complete implementation of a custom renderer that outputs markdown
 * instead of HTML. This demonstrates how easy it is to create new output
 * formats without needing Obsidian-specific dependencies.
 */

import type { App, Component } from 'obsidian';
import type { TasksFile } from '../Scripting/TasksFile';
import { MarkdownQueryResultsVisitor } from './MarkdownQueryResultsVisitor';
import { type QueryRendererParameters, QueryResultsRenderer } from './QueryResultsRenderer';
import type { QueryResultsVisitor } from './QueryResultsVisitor';
import type { TaskLineRenderer, TextRenderer } from './TaskLineRenderer';

/**
 * A renderer that generates markdown output instead of HTML.
 *
 * Usage:
 * ```typescript
 * const renderer = new MarkdownQueryResultsRenderer(
 *     'block-language-tasks',
 *     'not done\ngroup by folder',
 *     tasksFile,
 *     renderMarkdown,
 *     obsidianComponent,
 *     obsidianApp,
 * );
 *
 * // Render the query
 * const content = document.createElement('div');
 * await renderer.render(State.Warm, allTasks, content, queryRendererParameters);
 *
 * // Get the markdown output
 * const markdown = renderer.getMarkdownOutput();
 *
 * // Use the markdown (copy to clipboard, save to file, etc.)
 * await navigator.clipboard.writeText(markdown);
 * ```
 */
export class MarkdownQueryResultsRenderer extends QueryResultsRenderer {
    private markdownVisitor: MarkdownQueryResultsVisitor | null = null;

    constructor(
        className: string,
        source: string,
        tasksFile: TasksFile,
        renderMarkdown: (
            app: App,
            markdown: string,
            el: HTMLElement,
            sourcePath: string,
            component: Component,
        ) => Promise<void>,
        obsidianComponent: Component | null,
        obsidianApp: App,
        textRenderer?: TextRenderer,
    ) {
        super(className, source, tasksFile, renderMarkdown, obsidianComponent, obsidianApp, textRenderer);
    }

    /**
     * Override createVisitor to use MarkdownQueryResultsVisitor.
     *
     * Note: The markdown visitor doesn't need the HTML-specific parameters
     * (taskList, taskLineRenderer, queryRendererParameters), so we ignore them.
     */
    protected createVisitor(
        _content: HTMLDivElement,
        _taskList: HTMLUListElement,
        _taskLineRenderer: TaskLineRenderer,
        _queryRendererParameters: QueryRendererParameters,
    ): QueryResultsVisitor {
        // Reset any previous visitor
        if (this.markdownVisitor) {
            this.markdownVisitor.reset();
        }

        // Create a new markdown visitor - no Obsidian dependencies needed!
        this.markdownVisitor = new MarkdownQueryResultsVisitor();

        return this.markdownVisitor;
    }

    /**
     * Get the markdown output generated during the last render.
     *
     * @returns The markdown text, or an empty string if not yet rendered
     */
    public getMarkdownOutput(): string {
        return this.markdownVisitor?.getMarkdown() ?? '';
    }

    /**
     * Reset the markdown output.
     * Useful if you want to re-render with the same renderer instance.
     */
    public resetMarkdownOutput(): void {
        this.markdownVisitor?.reset();
    }

    /**
     * Convenience method to render and return markdown in one call.
     *
     * @param state - The cache state
     * @param tasks - All tasks to render
     * @param queryRendererParameters - Parameters for rendering
     * @returns The rendered markdown output
     */
    public async renderToMarkdown(state: any, tasks: any[], queryRendererParameters: any): Promise<string> {
        const content = document.createElement('div');
        await this.render(state, tasks, content, queryRendererParameters);
        return this.getMarkdownOutput();
    }
}

/**
 * Example usage scenarios:
 */

// Example 1: Copy query results to clipboard as markdown
export async function copyQueryResultsAsMarkdown(
    renderer: MarkdownQueryResultsRenderer,
    state: any,
    tasks: any[],
    queryRendererParameters: any,
): Promise<void> {
    const markdown = await renderer.renderToMarkdown(state, tasks, queryRendererParameters);
    await navigator.clipboard.writeText(markdown);
    console.log('Query results copied to clipboard as markdown');
}

// Example 2: Export query results to a markdown file
export async function exportQueryResultsToFile(
    renderer: MarkdownQueryResultsRenderer,
    state: any,
    tasks: any[],
    queryRendererParameters: any,
    app: App,
    fileName: string,
): Promise<void> {
    const markdown = await renderer.renderToMarkdown(state, tasks, queryRendererParameters);

    // Create or update the file
    const file = app.vault.getAbstractFileByPath(fileName);
    if (file) {
        await app.vault.modify(file as any, markdown);
    } else {
        await app.vault.create(fileName, markdown);
    }

    console.log(`Query results exported to ${fileName}`);
}

// Example 3: Add query results to current note
export async function insertQueryResultsIntoNote(
    renderer: MarkdownQueryResultsRenderer,
    state: any,
    tasks: any[],
    queryRendererParameters: any,
    app: App,
): Promise<void> {
    const markdown = await renderer.renderToMarkdown(state, tasks, queryRendererParameters);

    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        console.error('No active file');
        return;
    }

    const currentContent = await app.vault.read(activeFile);
    const newContent = currentContent + '\n\n' + markdown;
    await app.vault.modify(activeFile, newContent);

    console.log('Query results inserted into current note');
}

// Example 4: Log query results to console for debugging
export async function logQueryResultsAsMarkdown(
    renderer: MarkdownQueryResultsRenderer,
    state: any,
    tasks: any[],
    queryRendererParameters: any,
): Promise<void> {
    const markdown = await renderer.renderToMarkdown(state, tasks, queryRendererParameters);
    console.log('Query Results:\n' + markdown);
}
