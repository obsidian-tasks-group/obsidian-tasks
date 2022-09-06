import type { LayoutOptions } from './LayoutOptions';
import type { Task } from './Task';
import type { TaskGroups } from './Query/TaskGroups';
import type { Grouping } from './Query/Query';

/**
 * Standard interface for the query engine used by Tasks, multiple
 * engines can be created by using this and then updating the
 * Query Render class to handle the syntax for the new query engine.
 *
 * @export
 * @interface IQuery
 */
export interface IQuery {
    /**
     * This is the text from the code block in markdown and contains
     * the query to be used by a implementation of the IQuery.
     *
     * @type {string}
     * @memberof IQuery
     */
    source: string;

    /**
     * Collection of groupings being used in this query, this is based off
     * the main task properties like backlink, heading, path, status, etc.
     *
     * @type {Grouping[]}
     * @memberof IQuery
     */
    grouping: Grouping[];

    /**
     * Error message if there is an error in the query. This will be
     * shown to users.
     *
     * @type {(string | undefined)}
     * @memberof IQuery
     */
    error: string | undefined;

    /**
     * Any layout options the query engine should be aware of or
     * used in the query.
     *
     * @type {LayoutOptions}
     * @memberof IQuery
     */
    layoutOptions: LayoutOptions;

    /**
     * Main method for executing the query. This will be called by the
     * code block processor registered in Obsidian. It takes the Task collection
     * from the cache and returns a TaskGroup collection. If there is no grouping
     * then the TaskGroup collection will contain a single TaskGroup with all tasks
     * found using the query.
     *
     * @param {Task[]} tasks
     * @return {*}  {TaskGroups}
     * @memberof Query
     */
    applyQueryToTasks: (tasks: Task[]) => TaskGroups;
}
