import type { TasksFile } from '../Scripting/TasksFile';

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(_tasksFile: TasksFile) {
        return '';
    }
}
