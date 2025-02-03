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
        const instructions = [
            // Instructions are listed in the order that items are displayed in Tasks search results
            this.instruction(tasksFile, 'tasks_query_explain', 'explain', ''),
            this.instruction(tasksFile, 'tasks_query_short_mode', 'short mode', 'full mode'),
            this.showAndHide(tasksFile, 'tasks_query_show_tree', 'tree'),

            // Fields that appear before date values:
            this.showAndHide(tasksFile, 'tasks_query_show_tags', 'tags'),
            this.showAndHide(tasksFile, 'tasks_query_show_id', 'id'),
            this.showAndHide(tasksFile, 'tasks_query_show_depends_on', 'depends on'),
            this.showAndHide(tasksFile, 'tasks_query_show_priority', 'priority'),
            this.showAndHide(tasksFile, 'tasks_query_show_recurrence_rule', 'recurrence rule'),
            this.showAndHide(tasksFile, 'tasks_query_show_on_completion', 'on completion'),

            // Date fields:
            this.showAndHide(tasksFile, 'tasks_query_show_created_date', 'created date'),
            this.showAndHide(tasksFile, 'tasks_query_show_start_date', 'start date'),
            this.showAndHide(tasksFile, 'tasks_query_show_scheduled_date', 'scheduled date'),
        ];
        return instructions.filter((i) => i !== '').join('\n');
    }

    private instruction(tasksFile: TasksFile, prop: string, trueValue: string, falseValue: string) {
        return (tasksFile.hasProperty(prop) && (tasksFile.property(prop) ? trueValue : falseValue)) || '';
    }

    private showAndHide(tasksFile: TasksFile, prop: string, field: string) {
        return this.instruction(tasksFile, prop, 'show ' + field, 'hide ' + field);
    }

    public query(tasksFile: OptionalTasksFile) {
        return new Query(this.source(tasksFile), tasksFile);
    }
}
