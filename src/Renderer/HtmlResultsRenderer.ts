import { type App, type Component, Notice, type TFile } from 'obsidian';
import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import { explainResults } from '../Query/QueryRendererHelper';
import type { State } from '../Obsidian/Cache';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { HtmlQueryResultsVisitor } from './HtmlQueryResultsVisitor';
import { QueryResultsRendererBase } from './QueryResultsRendererBase';
import type { QueryResultsVisitor } from './QueryResultsVisitor';
import { TaskLineRenderer, type TextRenderer, createAndAppendElement } from './TaskLineRenderer';

export type BacklinksEventHandler = (ev: MouseEvent, task: Task) => Promise<void>;
export type EditButtonClickHandler = (event: MouseEvent, task: Task, allTasks: Task[]) => void;

/**
 * Parameters required for HTML rendering.
 */
export interface QueryRendererParameters {
    allTasks: Task[];
    allMarkdownFiles: TFile[];
    backlinksClickHandler: BacklinksEventHandler;
    backlinksMousedownHandler: BacklinksEventHandler;
    editTaskPencilClickHandler: EditButtonClickHandler;
}

/**
 * HTML renderer - outputs query results as HTML DOM elements.
 *
 * This is the Obsidian-specific renderer that creates interactive HTML
 * with edit buttons, backlinks, postpone buttons, etc.
 *
 * Parallel to MarkdownQueryResultsRenderer.
 */
export class HtmlResultsRenderer extends QueryResultsRendererBase {
    private readonly textRenderer: TextRenderer;
    private readonly renderMarkdown: (
        app: App,
        markdown: string,
        el: HTMLElement,
        sourcePath: string,
        component: Component,
    ) => Promise<void>;
    private readonly obsidianComponent: Component | null;
    private readonly obsidianApp: App;

    // HTML-specific state
    private content: HTMLDivElement | null = null;
    private queryRendererParameters: QueryRendererParameters | null = null;

    constructor(
        source: string,
        tasksFile: TasksFile,
        query: IQuery,
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
        super(source, tasksFile, query);

        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.textRenderer = textRenderer;
    }

    public rereadQueryFromFile(): void {
        // HtmlResultsRenderer doesn't recreate the query - it's passed in constructor
        // Query management is handled by the wrapper class
    }

    /**
     * Set the HTML content container for the next render.
     * MUST be called before each render operation.
     */
    public setContent(content: HTMLDivElement): void {
        this.content = content;
    }

    /**
     * Set the query renderer parameters for the next render.
     * MUST be called before each render operation.
     */
    public setQueryRendererParameters(queryRendererParameters: QueryRendererParameters): void {
        this.queryRendererParameters = queryRendererParameters;
    }

    /**
     * Render method that sets up HTML-specific state.
     */
    public async render(
        state: State | State.Warm,
        tasks: Task[],
        content: HTMLDivElement,
        queryRendererParameters: QueryRendererParameters,
    ) {
        this.content = content;
        this.queryRendererParameters = queryRendererParameters;
        await this.renderQuery(state, tasks);
    }

    /**
     * Stage 2 API: Render a pre-executed QueryResult.
     */
    public async renderWithQueryResult(queryResult: QueryResult): Promise<void> {
        if (!this.content || !this.queryRendererParameters) {
            throw new Error('Must call setContent() and setQueryRendererParameters() before renderWithQueryResult()');
        }
        await super.renderWithQueryResult(queryResult);
    }

    /**
     * Stage 2 API: Render error state.
     */
    public renderWithError(errorMessage: string): void {
        if (!this.content || !this.queryRendererParameters) {
            throw new Error('Must call setContent() and setQueryRendererParameters() before renderWithError()');
        }
        super.renderWithError(errorMessage);
    }

    /**
     * Stage 2 API: Render loading state.
     */
    public renderWithLoading(): void {
        if (!this.content || !this.queryRendererParameters) {
            throw new Error('Must call setContent() and setQueryRendererParameters() before renderWithLoading()');
        }
        super.renderWithLoading();
    }

    protected createVisitor(): QueryResultsVisitor {
        if (!this.content || !this.queryRendererParameters) {
            throw new Error('Must call render() before creating visitor');
        }

        const taskList = createAndAppendElement('ul', this.content);
        taskList.classList.add('contains-task-list', 'plugin-tasks-query-result');
        taskList.classList.add(...new TaskLayout(this.query.taskLayoutOptions).generateHiddenClasses());
        taskList.classList.add(...new QueryLayout(this.query.queryLayoutOptions).getHiddenClasses());

        const groupingAttribute = this.getGroupingAttribute();
        if (groupingAttribute && groupingAttribute.length > 0) {
            taskList.dataset.taskGroupBy = groupingAttribute;
        }

        const taskLineRenderer = new TaskLineRenderer({
            textRenderer: this.textRenderer,
            obsidianApp: this.obsidianApp,
            obsidianComponent: this.obsidianComponent,
            parentUlElement: taskList,
            taskLayoutOptions: this.query.taskLayoutOptions,
            queryLayoutOptions: this.query.queryLayoutOptions,
        });

        return new HtmlQueryResultsVisitor(
            this.query,
            this.tasksFile,
            this.content,
            taskList,
            taskLineRenderer,
            this.renderMarkdown,
            this.obsidianComponent,
            this.obsidianApp,
            this.filePath,
            this.queryRendererParameters,
        );
    }

    protected renderError(errorMessage: string): void {
        if (this.content) {
            this.content.createDiv().innerHTML =
                '<pre>' + `Tasks query: ${errorMessage.replace(/\n/g, '<br>')}` + '</pre>';
        }
    }

    protected renderLoading(): void {
        if (this.content) {
            this.content.setText('Loading Tasks ...');
        }
    }

    protected renderExplanation(): void {
        if (!this.content) return;

        const explanationAsString = explainResults(
            this.source,
            GlobalFilter.getInstance(),
            GlobalQuery.getInstance(),
            this.tasksFile,
        );

        const explanationsBlock = createAndAppendElement('pre', this.content);
        explanationsBlock.classList.add('plugin-tasks-query-explanation');
        explanationsBlock.setText(explanationAsString);
        this.content.appendChild(explanationsBlock);
    }

    protected beforeResults(queryResult: QueryResult): void {
        if (!this.content) return;

        const copyButton = createAndAppendElement('button', this.content);
        copyButton.textContent = 'Copy results';
        copyButton.classList.add('plugin-tasks-copy-button');
        copyButton.addEventListener('click', async () => {
            await navigator.clipboard.writeText(queryResult.asMarkdown());
            new Notice('Results copied to clipboard');
        });
    }

    protected afterResults(queryResult: QueryResult): void {
        if (!this.content) return;

        if (!this.query.queryLayoutOptions.hideTaskCount) {
            const taskCount = createAndAppendElement('div', this.content);
            taskCount.classList.add('task-count');
            taskCount.textContent = queryResult.totalTasksCountDisplayText();
        }
    }

    private getGroupingAttribute(): string {
        const groupingRules: string[] = [];
        for (const group of this.query.grouping) {
            groupingRules.push(group.property);
        }
        return groupingRules.join(',');
    }
}
