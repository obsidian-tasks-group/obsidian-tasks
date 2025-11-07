import type { TasksFile } from '../Scripting/TasksFile';
import type { IQuery } from '../IQuery';

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

export class QueryResultsRendererBase {}
