import type { OptionalTasksFile, TasksFile } from '../Scripting/TasksFile';
import { Query } from './Query';

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(tasksFile: OptionalTasksFile) {
        if (!tasksFile) {
            return '';
        }
        return this.instruction(tasksFile, 'tasks_query_short_mode', 'short mode', 'full mode');
    }

    private instruction(tasksFile: TasksFile, prop: string, trueValue: string, falseValue: string) {
        return (tasksFile.hasProperty(prop) && (tasksFile.property(prop) ? trueValue : falseValue)) || '';
    }

    public query(tasksFile: OptionalTasksFile) {
        return new Query(this.source(tasksFile), tasksFile);
    }
}
