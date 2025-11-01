import type { App, Component } from 'obsidian';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { getQueryForQueryRenderer } from '../Query/QueryRendererHelper';
import type { State } from '../Obsidian/Cache';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import {
    type BacklinksEventHandler,
    type EditButtonClickHandler,
    HtmlQueryResultsRenderer,
    type QueryRendererParameters,
} from './HtmlQueryResultsRenderer';
import { TaskLineRenderer, type TextRenderer } from './TaskLineRenderer';

// Re-export types for backward compatibility
export type { BacklinksEventHandler, EditButtonClickHandler, QueryRendererParameters };

/**
 * The `QueryResultsRenderer` class is responsible for rendering the results
 * of a query applied to a set of tasks.
 *
 * This class now acts as a facade that manages query lifecycle and delegates
 * HTML rendering to HtmlResultsRenderer.
 */
export class QueryResultsRenderer {
    protected queryType: string;
    public readonly source: string;
    public tasksFile: TasksFile;
    public query: IQuery;

    private readonly htmlRenderer: HtmlQueryResultsRenderer;

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
        textRenderer: TextRenderer = TaskLineRenderer.obsidianMarkdownRenderer,
    ) {
        this.source = source;
        this.tasksFile = tasksFile;
        this.query = QueryResultsRenderer.makeQuery(source, tasksFile);

        // Create the HTML renderer
        this.htmlRenderer = new HtmlQueryResultsRenderer(
            source,
            tasksFile,
            this.query,
            renderMarkdown,
            obsidianComponent,
            obsidianApp,
            textRenderer,
        );

        switch (className) {
            case 'block-language-tasks':
                this.queryType = 'tasks';
                break;
            default:
                this.queryType = 'tasks';
                break;
        }
    }

    private static makeQuery(source: string, tasksFile: TasksFile): IQuery {
        return getQueryForQueryRenderer(source, GlobalQuery.getInstance(), tasksFile);
    }

    /**
     * Reload the query from file (e.g., when settings change).
     */
    public rereadQueryFromFile() {
        this.query = QueryResultsRenderer.makeQuery(this.source, this.tasksFile);

        // Update the HTML renderer with the new query
        this.htmlRenderer.query = this.query;
    }

    /**
     * Update the tasks file and reload the query.
     */
    public setTasksFile(newFile: TasksFile) {
        this.tasksFile = newFile;
        this.htmlRenderer.setTasksFile(newFile);
        this.rereadQueryFromFile();
    }

    /**
     * Get the file path of the current tasks file.
     */
    public get filePath(): string | undefined {
        return this.tasksFile?.path ?? undefined;
    }

    /**
     * Render method - executes query and delegates rendering to HtmlResultsRenderer.
     */
    public async render(
        state: State | State.Warm,
        tasks: Task[],
        content: HTMLDivElement,
        queryRendererParameters: QueryRendererParameters,
    ) {
        // Stage 2: Execute query in wrapper, set up renderer state, pass result to renderer

        // Set up per-render state in the renderer
        this.htmlRenderer.setContent(content);
        this.htmlRenderer.setQueryRendererParameters(queryRendererParameters);

        await this.htmlRenderer.renderQuery(state, tasks);
    }
}
