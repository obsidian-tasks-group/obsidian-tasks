import type { App, Component, TFile } from 'obsidian';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { PerformanceTracker } from '../lib/PerformanceTracker';
import type { State } from '../Obsidian/Cache';
import { getQueryForQueryRenderer } from '../Query/QueryRendererHelper';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { HtmlQueryResultsRenderer } from './HtmlQueryResultsRenderer';
import type { TextRenderer } from './TaskLineRenderer';

export type BacklinksEventHandler = (ev: MouseEvent, task: Task) => Promise<void>;
export type EditButtonClickHandler = (event: MouseEvent, task: Task, allTasks: Task[]) => void;

/**
 * Represent the parameters required for rendering a query with {@link QueryResultsRenderer}.
 *
 * This interface contains all the necessary properties and handlers to manage
 * and display query results such as tasks, markdown files, and certain event handlers
 * for user interactions, like handling backlinks and editing tasks.
 */
export interface QueryRendererParameters {
    allTasks: () => Task[];
    allMarkdownFiles: () => TFile[];
    backlinksClickHandler: BacklinksEventHandler;
    backlinksMousedownHandler: BacklinksEventHandler;
    editTaskPencilClickHandler: EditButtonClickHandler;
}

/**
 * The `QueryResultsRenderer` class is responsible for rendering the results
 * of a query applied to a set of tasks.
 *
 * It handles the construction of task groupings and the application of visual styles.
 */
export class QueryResultsRenderer {
    /**
     * The complete text in the instruction block, such as:
     * ```
     *   not done
     *   short mode
     * ```
     *
     * This does not contain the Global Query from the user's settings.
     * Use {@link getQueryForQueryRenderer} to get this value prefixed with the Global Query.
     */
    public readonly source: string;

    private readonly htmlRenderer: HtmlQueryResultsRenderer;

    // The path of the file that contains the instruction block, and cached data from that file.
    // This can be updated when the query file's frontmatter is modified.
    // It is up to the caller to determine when to do this though.
    private _tasksFile: TasksFile;

    public query: IQuery;
    protected queryType: string; // whilst there is only one query type, there is no point logging this value

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
        textRenderer: TextRenderer,
        queryRendererParameters: QueryRendererParameters,
    ) {
        this.source = source;
        this._tasksFile = tasksFile;

        // The engine is chosen on the basis of the code block language. Currently,
        // there is only the main engine for the plugin, this allows others to be
        // added later.
        switch (className) {
            case 'block-language-tasks':
                this.query = this.makeQueryFromSourceAndTasksFile();
                this.queryType = 'tasks';
                break;

            default:
                this.query = this.makeQueryFromSourceAndTasksFile();
                this.queryType = 'tasks';
                break;
        }

        this.htmlRenderer = new HtmlQueryResultsRenderer(
            renderMarkdown,
            obsidianComponent,
            obsidianApp,
            textRenderer,
            queryRendererParameters,
            {
                source: () => this.source,
                tasksFile: () => this._tasksFile,
                query: () => this.query,
            },
        );
    }

    private makeQueryFromSourceAndTasksFile() {
        return getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.tasksFile);
    }

    public get tasksFile(): TasksFile {
        return this._tasksFile;
    }

    /**
     * Reload the query with new file information, such as to update query placeholders.
     * @param newFile
     */
    public setTasksFile(newFile: TasksFile) {
        this._tasksFile = newFile;
        this.rereadQueryFromFile();
    }

    /**
     * Reads the query from the source file and tasks file.
     *
     * This is for when some change in the vault invalidates the current
     * Query object, and so it needs to be reloaded.
     *
     * For example, the user edited their Tasks plugin settings in some
     * way that changes how the query is interpreted, such as changing a
     * 'presets' definition.
     */
    public rereadQueryFromFile() {
        this.query = this.makeQueryFromSourceAndTasksFile();
    }

    public get filePath(): string | undefined {
        return this.tasksFile.path;
    }

    public async render(state: State, tasks: Task[], content: HTMLDivElement) {
        const measureSearch = new PerformanceTracker(`Search: ${this.query.queryId} - ${this.filePath}`);
        measureSearch.start();
        const queryResult = this.query.applyQueryToTasks(tasks);
        measureSearch.finish();

        const measureRender = new PerformanceTracker(`Render: ${this.query.queryId} - ${this.filePath}`);
        measureRender.start();
        this.htmlRenderer.content = content;
        this.addToolbar(queryResult);
        await this.htmlRenderer.renderQuery(state, queryResult);
        measureRender.finish();
    }

    private addToolbar(queryResult: QueryResult) {
        this.htmlRenderer.addToolbar(queryResult);
    }
}
