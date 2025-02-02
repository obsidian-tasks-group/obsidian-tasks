import type { OptionalTasksFile } from '../Scripting/TasksFile';
import { Query } from './Query';

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(tasksFile: OptionalTasksFile) {
        if (!tasksFile) {
            return '';
        }
        const prop = 'tasks-query-short-mode';
        return (tasksFile.hasProperty(prop) && (tasksFile.property(prop) ? 'short mode' : 'full mode')) || '';
    }

    public query(tasksFile: OptionalTasksFile) {
        return new Query(this.source(tasksFile), tasksFile);
    }
}
