import type { IQuery } from '../IQuery';
import { PerformanceTracker } from '../lib/PerformanceTracker';
import { State } from '../Obsidian/Cache';
import type { TaskGroups } from '../Query/Group/TaskGroups';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { ListItem } from '../Task/ListItem';
import { Task } from '../Task/Task';
import type { QueryResultsVisitor, VisitorRenderContext } from './QueryResultsVisitor';

/**
 * Abstract base class for rendering query results.
 *
 * This class handles the core logic of:
 * - Applying queries to tasks
 * - Grouping and sorting
 * - Tree structure traversal
 * - Delegating actual rendering to visitors
 *
 * Subclasses provide the visitor implementation and any environment-specific setup.
 */
export abstract class QueryResultsRendererBase {
    public readonly source: string;
    private _tasksFile: TasksFile;
    public query: IQuery;

    constructor(source: string, tasksFile: TasksFile, query: IQuery) {
        this.source = source;
        this._tasksFile = tasksFile;
        this.query = query;
    }

    public get tasksFile(): TasksFile {
        return this._tasksFile;
    }

    public setTasksFile(newFile: TasksFile) {
        this._tasksFile = newFile;
        this.rereadQueryFromFile();
    }

    public get filePath(): string | undefined {
        return this.tasksFile?.path ?? undefined;
    }

    /**
     * Reload the query (e.g., when file or settings change).
     * Subclasses must implement this.
     */
    public abstract rereadQueryFromFile(): void;

    /**
     * Main rendering method - performs query and renders results.
     * Subclasses typically don't need to override this.
     */
    public async renderQuery(state: State | State.Warm, tasks: Task[]): Promise<void> {
        if (state === State.Warm && this.query.error === undefined) {
            await this.renderQuerySearchResults(tasks, state);
        } else if (this.query.error !== undefined) {
            this.renderError(this.query.error);
        } else {
            this.renderLoading();
        }
    }

    private async renderQuerySearchResults(tasks: Task[], state: State.Warm) {
        const queryResult = this.explainAndPerformSearch(state, tasks);

        if (queryResult.searchErrorMessage !== undefined) {
            this.renderError(queryResult.searchErrorMessage);
            return;
        }

        await this.renderResults(queryResult);
    }

    private explainAndPerformSearch(state: State.Warm, tasks: Task[]): QueryResult {
        const measureSearch = new PerformanceTracker(`Search: ${this.query.queryId} - ${this.filePath}`);
        measureSearch.start();

        this.query.debug(`[render] Render called: plugin state: ${state}; searching ${tasks.length} tasks`);

        if (this.query.queryLayoutOptions.explainQuery) {
            this.renderExplanation();
        }

        const queryResult = this.query.applyQueryToTasks(tasks);

        measureSearch.finish();
        return queryResult;
    }

    private async renderResults(queryResult: QueryResult) {
        const measureRender = new PerformanceTracker(`Render: ${this.query.queryId} - ${this.filePath}`);
        measureRender.start();

        this.beforeResults(queryResult);

        await this.renderAllTaskGroups(queryResult.taskGroups);

        this.afterResults(queryResult);

        this.query.debug(`[render] ${queryResult.totalTasksCount} tasks displayed`);

        measureRender.finish();
    }

    private async renderAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups) {
        for (const group of tasksSortedLimitedGrouped.groups) {
            const visitor = this.createVisitor();
            const context = this.createRenderContext();

            // Render group headings
            for (const heading of group.groupHeadings) {
                await visitor.addGroupHeading(heading);
            }

            // Render tasks
            const renderedListItems: Set<ListItem> = new Set();
            await this.renderTaskList(visitor, context, group.tasks, renderedListItems);
        }
    }

    private async renderTaskList(
        visitor: QueryResultsVisitor,
        context: VisitorRenderContext,
        listItems: ListItem[],
        renderedListItems: Set<ListItem>,
    ): Promise<void> {
        for (const [listItemIndex, listItem] of listItems.entries()) {
            if (this.query.queryLayoutOptions.hideTree) {
                // Flat list - only render tasks
                if (listItem instanceof Task) {
                    await visitor.addTask(listItem, listItemIndex, context);
                }
            } else {
                // Tree mode - render with children
                await this.renderTaskOrListItemAndChildren(
                    visitor,
                    context,
                    listItem,
                    listItemIndex,
                    listItems,
                    renderedListItems,
                );
            }
        }
    }

    private async renderTaskOrListItemAndChildren(
        visitor: QueryResultsVisitor,
        context: VisitorRenderContext,
        listItem: ListItem,
        taskIndex: number,
        listItems: ListItem[],
        renderedListItems: Set<ListItem>,
    ) {
        if (renderedListItems.has(listItem)) {
            return;
        }

        if (this.willBeRenderedLater(listItem, renderedListItems, listItems)) {
            return;
        }

        // Render the item
        if (listItem instanceof Task) {
            await visitor.addTask(listItem, taskIndex, context);
        } else {
            await visitor.addListItem(listItem, taskIndex, context);
        }
        renderedListItems.add(listItem);

        // Render children
        if (listItem.children.length > 0) {
            await this.renderChildren(visitor, context, listItem, renderedListItems);
        }
    }

    private async renderChildren(
        visitor: QueryResultsVisitor,
        context: VisitorRenderContext,
        listItem: ListItem,
        renderedListItems: Set<ListItem>,
    ) {
        // Begin rendering children (creates nested list or increases indent)
        visitor.beginChildren();

        for (const [childIndex, childItem] of listItem.children.entries()) {
            await this.renderTaskOrListItemAndChildren(
                visitor,
                context,
                childItem,
                childIndex,
                listItem.children,
                renderedListItems,
            );
        }

        // End rendering children (returns to parent context or decreases indent)
        visitor.endChildren();
    }

    /**
     * Render children for HTML visitors that need nested DOM structure.
     * Subclasses that support HTML should override this.
     */
    protected async renderChildrenForHtmlVisitor(
        _parentElement: HTMLElement,
        _children: ListItem[],
        _renderedListItems: Set<ListItem>,
    ): Promise<void> {
        // Default implementation just recurses (for non-HTML subclasses)
        // HTML subclasses should override this to create nested <ul> elements
    }

    private willBeRenderedLater(listItem: ListItem, renderedListItems: Set<ListItem>, listItems: ListItem[]): boolean {
        const closestParentTask = listItem.findClosestParentTask();
        if (!closestParentTask) {
            return false;
        }

        if (!renderedListItems.has(closestParentTask)) {
            if (listItems.includes(closestParentTask)) {
                return true;
            }
        }

        return false;
    }

    protected createRenderContext(): VisitorRenderContext {
        return {
            queryFilePath: this.filePath,
            hideUrgency: this.query.queryLayoutOptions.hideUrgency,
            hideBacklinks: this.query.queryLayoutOptions.hideBacklinks,
            hideEditButton: this.query.queryLayoutOptions.hideEditButton,
            hidePostponeButton: this.query.queryLayoutOptions.hidePostponeButton,
            shortMode: this.query.queryLayoutOptions.shortMode,
        };
    }

    // Abstract methods that subclasses must implement

    /**
     * Create the visitor for rendering.
     */
    protected abstract createVisitor(): QueryResultsVisitor;

    /**
     * Render error message.
     */
    protected abstract renderError(errorMessage: string): void;

    /**
     * Render loading state.
     */
    protected abstract renderLoading(): void;

    /**
     * Render query explanation (optional).
     */
    protected abstract renderExplanation(): void;

    /**
     * Called before rendering results (e.g., add copy button).
     */
    protected abstract beforeResults(queryResult: QueryResult): void;

    /**
     * Called after rendering results (e.g., add task count).
     */
    protected abstract afterResults(queryResult: QueryResult): void;
}
