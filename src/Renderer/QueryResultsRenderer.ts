import { type App, type Component, Notice, type TFile, setIcon, setTooltip } from 'obsidian';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { PerformanceTracker } from '../lib/PerformanceTracker';
import { State } from '../Obsidian/Cache';
import { DescriptionField } from '../Query/Filter/DescriptionField';
import { Query } from '../Query/Query';
import { getQueryForQueryRenderer } from '../Query/QueryRendererHelper';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { HtmlQueryResultsRenderer } from './HtmlQueryResultsRenderer';
import { MarkdownQueryResultsRenderer } from './MarkdownQueryResultsRenderer';
import { type TextRenderer, createAndAppendElement } from './TaskLineRenderer';

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
    private readonly markdownRenderer: MarkdownQueryResultsRenderer;

    // The path of the file that contains the instruction block, and cached data from that file.
    // This can be updated when the query file's frontmatter is modified.
    // It is up to the caller to determine when to do this though.
    private _tasksFile: TasksFile;

    public query: IQuery;
    protected queryType: string; // whilst there is only one query type, there is no point logging this value
    public queryResult: QueryResult;
    public filteredQueryResult: QueryResult;
    private _filterString: string = '';

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

        // Store empty query result for now
        this.queryResult = new Query('').applyQueryToTasks([]);
        this.filteredQueryResult = this.queryResult;

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

        const getters = {
            source: () => this.source,
            tasksFile: () => this._tasksFile,
            query: () => this.query,
        };

        this.htmlRenderer = new HtmlQueryResultsRenderer(
            renderMarkdown,
            obsidianComponent,
            obsidianApp,
            textRenderer,
            queryRendererParameters,
            getters,
        );

        this.markdownRenderer = new MarkdownQueryResultsRenderer(getters);
    }

    public get filterString(): string {
        return this._filterString;
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
        this.performSearch(tasks);
        this.addToolbar(content);
        await this.renderQueryResult(state, this.filteredQueryResult, content);
    }

    private performSearch(tasks: Task[]) {
        const measureSearch = new PerformanceTracker(`Search: ${this.query.queryId} - ${this.filePath}`);
        measureSearch.start();
        this.queryResult = this.query.applyQueryToTasks(tasks);
        this.filterResults();
        measureSearch.finish();
    }

    private async renderQueryResult(state: State, queryResult: QueryResult, content: HTMLDivElement) {
        const measureRender = new PerformanceTracker(`Render: ${this.query.queryId} - ${this.filePath}`);
        measureRender.start();
        this.htmlRenderer.content = content;
        await this.htmlRenderer.renderQuery(state, queryResult);
        measureRender.finish();
    }

    private addToolbar(content: HTMLDivElement) {
        if (this.query.queryLayoutOptions.hideToolbar) {
            return;
        }

        const toolbar = createAndAppendElement('div', content);
        toolbar.classList.add('plugin-tasks-toolbar');
        this.addSearchBox(toolbar, content);
        this.addCopyButton(toolbar);
    }

    private addSearchBox(toolbar: HTMLDivElement, content: HTMLDivElement) {
        const label = createAndAppendElement('label', toolbar);
        setIcon(label, 'lucide-filter');
        const searchBox = createAndAppendElement('input', label);
        searchBox.value = this._filterString;
        searchBox.placeholder = 'Filter by description...';
        setTooltip(searchBox, 'Filter results');
        const doSearch = async () => {
            const filterString = searchBox.value;
            await this.applySearchBoxFilterAndRerender(filterString, content);
        };
        searchBox.addEventListener('input', doSearch);
    }

    public async applySearchBoxFilterAndRerender(filterString: string, content: HTMLDivElement) {
        this._filterString = filterString;

        this.filterResults();

        // We want to retain the Toolbar, to not lose the cursor position in the search string.
        // But we need to delete any pre-existing headings, tasks and task count.
        // The following while loop relies on the Toolbar being the first element.
        while (content.firstElementChild !== content.lastElementChild) {
            const lastChild = content.lastChild;
            if (lastChild === null) {
                break;
            }

            lastChild.remove();
        }

        await this.renderQueryResult(State.Warm, this.filteredQueryResult, content);
    }

    private filterResults() {
        const { filter, error } = new DescriptionField().createFilterOrErrorMessage(
            'description includes ' + this._filterString,
        );
        if (error) {
            // If we can't create a filter, just silently show all the matching tasks
            this.filteredQueryResult = this.queryResult;
            return;
        }

        this.filteredQueryResult = this.queryResult.applyFilter(filter!);
    }

    private addCopyButton(toolbar: HTMLDivElement) {
        const copyButton = createAndAppendElement('button', toolbar);
        setIcon(copyButton, 'lucide-copy');
        setTooltip(copyButton, 'Copy results');
        copyButton.addEventListener('click', async () => {
            const markdown = await this.resultsAsMarkdown();
            await navigator.clipboard.writeText(markdown);
            new Notice('Results copied to clipboard');
        });
    }

    public async resultsAsMarkdown() {
        await this.markdownRenderer.renderQuery(State.Warm, this.filteredQueryResult);
        return this.markdownRenderer.markdown;
    }
}
