import type { TasksFile } from '../Scripting/TasksFile';
import type { IQuery } from '../IQuery';
import { State } from '../Obsidian/Cache';
import type { Task } from '../Task/Task';
import type { QueryResult } from '../Query/QueryResult';
import type { TaskGroups } from '../Query/Group/TaskGroups';
import type { ListItem } from '../Task/ListItem';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import { PerformanceTracker } from '../lib/PerformanceTracker';
import { explainResults } from '../Query/QueryRendererHelper';
import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';

/**
 * Because properties in QueryResultsRenderer may be modified during the lifetime of this class,
 * we pass in getter functions instead of storing duplicate copies of the values.
 */

// TODO Remove export
export interface QueryResultsRendererGetters {
    source: () => string;
    tasksFile: () => TasksFile;
    query: () => IQuery;
}

export abstract class QueryResultsRendererBase {
    public getters: QueryResultsRendererGetters;

    constructor(getters: QueryResultsRendererGetters) {
        this.getters = getters;
    }

    protected get filePath(): string | undefined {
        return this.getters.tasksFile().path;
    }

    public async renderQuery(state: State | State.Warm, tasks: Task[]) {
        // Don't log anything here, for any state, as it generates huge amounts of
        // console messages in large vaults, if Obsidian was opened with any
        // notes with tasks code blocks in Reading or Live Preview mode.
        const error = this.getters.query().error;
        if (state === State.Warm && error === undefined) {
            await this.renderQuerySearchResults(tasks, state);
        } else if (error) {
            this.renderErrorMessage(error);
        } else {
            this.renderLoadingMessage();
        }
    }

    private async renderQuerySearchResults(tasks: Task[], state: State.Warm) {
        const queryResult = this.explainAndPerformSearch(state, tasks);

        if (queryResult.searchErrorMessage !== undefined) {
            // There was an error in the search, for example due to a problem custom function.
            this.renderErrorMessage(queryResult.searchErrorMessage);
            return;
        }

        await this.renderSearchResults(queryResult);
    }

    private explainAndPerformSearch(state: State.Warm, tasks: Task[]) {
        const measureSearch = new PerformanceTracker(`Search: ${this.getters.query().queryId} - ${this.filePath}`);
        measureSearch.start();

        this.getters.query().debug(`[render] Render called: plugin state: ${state}; searching ${tasks.length} tasks`);

        if (this.getters.query().queryLayoutOptions.explainQuery) {
            const explanation = explainResults(
                this.getters.source(),
                GlobalFilter.getInstance(),
                GlobalQuery.getInstance(),
                this.getters.tasksFile(),
            );
            this.renderExplanation(explanation);
        }

        const queryResult = this.getters.query().applyQueryToTasks(tasks);

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

    protected abstract addAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups): Promise<void>;

    protected abstract addTaskList(listItems: ListItem[]): Promise<void>;

    /**
     * Old-style rendering of tasks:
     * - What is rendered:
     *     - Only task lines that match the query are rendered, as a flat list
     * - The order that lines are rendered:
     *     - Tasks are rendered in the order specified in 'sort by' instructions and default sort order.
     * @param listItems
     * @private
     */
    protected abstract addFlatTaskList(listItems: ListItem[]): Promise<void>;

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
    protected abstract addTreeTaskList(listItems: ListItem[]): Promise<void>;

    // TODO Remove abstract
    protected abstract willBeAddedLater(listItem: ListItem, listItems: ListItem[]): boolean;

    // TODO Remove abstract
    protected abstract alreadyAdded(listItem: ListItem): boolean;

    protected abstract addListItem(listItem: ListItem, listItemIndex: number, children: ListItem[]): Promise<void>;

    protected abstract addTask(task: Task, taskIndex: number, children: ListItem[]): Promise<void>;

    /**
     * Display headings for a group of tasks.
     * @param groupHeadings - The headings to display. This can be an empty array,
     *                        in which case no headings will be added.
     * @private
     */
    protected abstract addGroupHeadings(groupHeadings: GroupDisplayHeading[]): Promise<void>;

    protected abstract addGroupHeading(group: GroupDisplayHeading): Promise<void>;
}
