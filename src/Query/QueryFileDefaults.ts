import type { TasksFile } from '../Scripting/TasksFile';

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(tasksFile: TasksFile) {
        const prop = 'TQ-short-mode';
        return (tasksFile.hasProperty(prop) && (tasksFile.property(prop) ? 'short mode' : 'full mode')) || '';
    }
}
