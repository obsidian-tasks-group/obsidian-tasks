import type { OptionalTasksFile } from '../Scripting/TasksFile';

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(tasksFile: OptionalTasksFile) {
        if (!tasksFile) {
            return '';
        }
        const prop = 'TQ-short-mode';
        return (tasksFile.hasProperty(prop) && (tasksFile.property(prop) ? 'short mode' : 'full mode')) || '';
    }
}
