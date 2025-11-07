import type { TasksFile } from '../Scripting/TasksFile';
import type { IQuery } from '../IQuery';
import type { State } from '../Obsidian/Cache';
import type { Task } from '../Task/Task';
import type { QueryResult } from '../Query/QueryResult';
import type { TaskGroups } from '../Query/Group/TaskGroups';
import type { ListItem } from '../Task/ListItem';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';

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

    public abstract renderQuery(state: State | State.Warm, tasks: Task[]): Promise<void>;

    protected abstract renderQuerySearchResults(tasks: Task[], state: State.Warm): Promise<void>;

    protected abstract explainAndPerformSearch(state: State.Warm, tasks: Task[]): any;

    protected abstract renderSearchResults(queryResult: QueryResult): Promise<void>;

    protected abstract renderErrorMessage(errorMessage: string): void;

    protected abstract renderLoadingMessage(): void;

    protected abstract renderExplanation(): void;

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
