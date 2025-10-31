import { type App, type Component, Notice, type TFile } from 'obsidian';
import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import { explainResults, getQueryForQueryRenderer } from '../Query/QueryRendererHelper';
import type { State } from '../Obsidian/Cache';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { ListItem } from '../Task/ListItem';
import { Task } from '../Task/Task';
import { HtmlQueryResultsVisitor } from './HtmlQueryResultsVisitor';
import { QueryResultsRendererBase } from './QueryResultsRendererBase';
import type { QueryResultsVisitor } from './QueryResultsVisitor';
import { TaskLineRenderer, type TextRenderer, createAndAppendElement } from './TaskLineRenderer';

export type BacklinksEventHandler = (ev: MouseEvent, task: Task) => Promise<void>;
export type EditButtonClickHandler = (event: MouseEvent, task: Task, allTasks: Task[]) => void;

/**
 * Parameters required for Obsidian HTML rendering with event handlers.
 */
export interface QueryRendererParameters {
    allTasks: Task[];
    allMarkdownFiles: TFile[];
    backlinksClickHandler: BacklinksEventHandler;
    backlinksMousedownHandler: BacklinksEventHandler;
    editTaskPencilClickHandler: EditButtonClickHandler;
}

/**
 * Obsidian-specific renderer that outputs HTML to the DOM.
 *
 * This is the original QueryResultsRenderer functionality.
 */
export class QueryResultsRenderer extends QueryResultsRendererBase {
    protected queryType: string;

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
        const query = QueryResultsRenderer.makeQuery(source, tasksFile);
        super(source, tasksFile, query);

        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.textRenderer = textRenderer;

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
    }

    /**
     * Original render method for backward compatibility.
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

    /**
     * Override to create nested <ul> elements for HTML rendering.
     */
    protected async renderChildrenForHtmlVisitor(
        parentElement: HTMLElement,
        children: ListItem[],
        renderedListItems: Set<ListItem>,
    ): Promise<void> {
        if (!this.queryRendererParameters) {
            throw new Error('queryRendererParameters not set');
        }

        // Create a nested task list inside the parent element
        const nestedTaskList = createAndAppendElement('ul', parentElement);
        nestedTaskList.classList.add('contains-task-list', 'plugin-tasks-query-result');
        nestedTaskList.classList.add(...new TaskLayout(this.query.taskLayoutOptions).generateHiddenClasses());
        nestedTaskList.classList.add(...new QueryLayout(this.query.queryLayoutOptions).getHiddenClasses());

        const nestedTaskLineRenderer = new TaskLineRenderer({
            textRenderer: this.textRenderer,
            obsidianApp: this.obsidianApp,
            obsidianComponent: this.obsidianComponent,
            parentUlElement: nestedTaskList,
            taskLayoutOptions: this.query.taskLayoutOptions,
            queryLayoutOptions: this.query.queryLayoutOptions,
        });

        const nestedVisitor = new HtmlQueryResultsVisitor(
            this.query,
            this.tasksFile,
            this.content!,
            nestedTaskList,
            nestedTaskLineRenderer,
            this.renderMarkdown,
            this.obsidianComponent,
            this.obsidianApp,
            this.filePath,
            this.queryRendererParameters,
        );

        const context = this.createRenderContext();

        for (const [childIndex, childItem] of children.entries()) {
            if (childItem instanceof Task) {
                await nestedVisitor.addTask(childItem, childIndex, context);
            } else {
                await nestedVisitor.addListItem(childItem, childIndex, context);
            }
            renderedListItems.add(childItem);

            // Recursively handle grandchildren
            if (childItem.children.length > 0) {
                const lastElement = nestedVisitor.getLastRenderedElement();
                if (lastElement) {
                    await this.renderChildrenForHtmlVisitor(lastElement, childItem.children, renderedListItems);
                }
            }
        }
    }
}
