import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { PerformanceTracker } from '../lib/PerformanceTracker';
import { State } from '../Obsidian/Cache';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { TaskGroups } from '../Query/Group/TaskGroups';
import { explainResults } from '../Query/QueryRendererHelper';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { ListItem } from '../Task/ListItem';
import { Task } from '../Task/Task';

/**
 * Because properties in QueryResultsRenderer may be modified during the lifetime of this class,
 * we pass in getter functions instead of storing duplicate copies of the values.
 */
export interface QueryResultsRendererGetters {
    source: () => string;
    tasksFile: () => TasksFile;
    query: () => IQuery;
}

export abstract class QueryResultsRendererBase {
    protected getters: QueryResultsRendererGetters;

    protected readonly addedListItems: Set<ListItem> = new Set<ListItem>();

    protected constructor(getters: QueryResultsRendererGetters) {
        this.getters = getters;
    }

    protected get filePath(): string | undefined {
        return this.getters.tasksFile().path;
    }

    public async renderQuery(state: State | State.Warm, tasks: Task[]) {
        this.beginRender();

        // Don't log anything here, for any state, as it generates huge amounts of
        // console messages in large vaults, if Obsidian was opened with any
        // notes with tasks code blocks in Reading or Live Preview mode.
        const query = this.getters.query();
        const error = query.error;
        if (state === State.Warm && error === undefined) {
            query.debug(`[render] Render called: plugin state: ${state}; searching ${tasks.length} tasks`);
            await this.renderQuerySearchResults(tasks, this.getters.query().applyQueryToTasks(tasks));
        } else if (error) {
            this.renderErrorMessage(error);
        } else {
            this.renderLoadingMessage();
        }
    }

    /**
     * This is called at the start of every render, implement this if you want to reset some state for each render.
     *
     * @protected
     */
    protected abstract beginRender(): void;

    private async renderQuerySearchResults(tasks: Task[], queryResult: QueryResult) {
        this.explainAndPerformSearch(tasks, queryResult);

        if (queryResult.searchErrorMessage !== undefined) {
            // There was an error in the search, for example due to a problem custom function.
            this.renderErrorMessage(queryResult.searchErrorMessage);
            return;
        }

        await this.renderSearchResults(queryResult);
    }

    private explainAndPerformSearch(_tasks: Task[], queryResult: QueryResult) {
        const measureSearch = new PerformanceTracker(`Search: ${this.getters.query().queryId} - ${this.filePath}`);
        measureSearch.start();

        if (this.getters.query().queryLayoutOptions.explainQuery) {
            const explanation = explainResults(
                this.getters.source(),
                GlobalFilter.getInstance(),
                GlobalQuery.getInstance(),
                this.getters.tasksFile(),
            );
            this.renderExplanation(explanation);
        }

        measureSearch.finish();
        return queryResult;
    }

    private async renderSearchResults(queryResult: QueryResult) {
        const measureRender = new PerformanceTracker(`Render: ${this.getters.query().queryId} - ${this.filePath}`);
        measureRender.start();

        this.renderSearchResultsHeader(queryResult);

        await this.addAllTaskGroups(queryResult.taskGroups);

        const totalTasksCount = queryResult.totalTasksCount;
        this.getters.query().debug(`[render] ${totalTasksCount} tasks displayed`);

        this.renderSearchResultsFooter(queryResult);

        measureRender.finish();
    }

    protected abstract renderSearchResultsHeader(queryResult: QueryResult): void;

    protected abstract renderSearchResultsFooter(queryResult: QueryResult): void;

    protected abstract renderErrorMessage(errorMessage: string): void;

    protected abstract renderLoadingMessage(): void;

    protected abstract renderExplanation(explanation: string | null): void;

    private async addAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups) {
        for (const group of tasksSortedLimitedGrouped.groups) {
            // If there were no 'group by' instructions, group.groupHeadings
            // will be empty, and no headings will be added.
            await this.addGroupHeadings(group.groupHeadings);

            this.addedListItems.clear();
            await this.addTaskList(group.tasks);
        }
    }

    protected async addTaskList(listItems: ListItem[]): Promise<void> {
        this.beginTaskList();

        try {
            if (this.getters.query().queryLayoutOptions.hideTree) {
                await this.addFlatTaskList(listItems);
            } else {
                await this.addTreeTaskList(listItems);
            }
        } finally {
            this.endTaskList();
        }
    }

    protected abstract beginTaskList(): void;

    protected abstract endTaskList(): void;

    /**
     * Old-style rendering of tasks:
     * - What is rendered:
     *     - Only task lines that match the query are rendered, as a flat list
     * - The order that lines are rendered:
     *     - Tasks are rendered in the order specified in 'sort by' instructions and default sort order.
     * @param listItems
     * @private
     */
    private async addFlatTaskList(listItems: ListItem[]): Promise<void> {
        for (const [listItemIndex, listItem] of listItems.entries()) {
            if (listItem instanceof Task) {
                this.beginListItem();
                await this.addTask(listItem, listItemIndex);
            }
        }
    }

    /** New-style rendering of tasks:
     *  - What is rendered:
     *      - Task lines that match the query are rendered, as a tree.
     *      - Currently, all child tasks and list items of the found tasks are shown,
     *        including any child tasks that did not match the query.
     *  - The order that lines are rendered:
     *      - The top-level/outermost tasks are sorted in the order specified in 'sort by'
     *        instructions and default sort order.
     *      - Child tasks (and list items) are shown in their original order in their Markdown file.
     * @param listItems
     * @private
     */
    private async addTreeTaskList(listItems: ListItem[]): Promise<void> {
        for (const [listItemIndex, listItem] of listItems.entries()) {
            if (this.alreadyAdded(listItem)) {
                continue;
            }

            if (this.willBeAddedLater(listItem, listItems)) {
                continue;
            }

            this.beginListItem();

            if (listItem instanceof Task) {
                await this.addTask(listItem, listItemIndex);
            } else {
                await this.addListItem(listItem, listItemIndex);
            }

            await this.addChildren(listItem.children);

            // The children of this item will be added thanks to recursion and the fact that we always render all children currently
            this.addedListItems.add(listItem);

            // We think this code may be needed in future, we have been unable to write a failing test for it
            // for (const childTask of listItem.children) {
            //     this.addedListItems.add(childTask);
            // }
        }
    }

    private willBeAddedLater(listItem: ListItem, listItems: ListItem[]) {
        const closestParentTask = listItem.findClosestParentTask();
        if (!closestParentTask) {
            return false;
        }

        if (!this.addedListItems.has(closestParentTask)) {
            // This task is a direct or indirect child of another task that we are waiting to draw,
            // so don't draw it yet, it will be done recursively later.
            if (listItems.includes(closestParentTask)) {
                return true;
            }
        }

        return false;
    }

    private alreadyAdded(listItem: ListItem) {
        return this.addedListItems.has(listItem);
    }

    protected abstract beginListItem(): void;

    protected abstract addListItem(listItem: ListItem, listItemIndex: number): Promise<void>;

    protected abstract addTask(task: Task, taskIndex: number): Promise<void>;

    private async addChildren(children: ListItem[]) {
        if (children.length > 0) {
            await this.addTaskList(children);
        }
    }

    /**
     * Display headings for a group of tasks.
     * @param groupHeadings - The headings to display. This can be an empty array,
     *                        in which case no headings will be added.
     * @private
     */
    private async addGroupHeadings(groupHeadings: GroupDisplayHeading[]) {
        for (const heading of groupHeadings) {
            await this.addGroupHeading(heading);
        }
    }

    protected abstract addGroupHeading(group: GroupDisplayHeading): Promise<void>;
}
