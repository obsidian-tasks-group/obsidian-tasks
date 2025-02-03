import type { OptionalTasksFile, TasksFile } from '../Scripting/TasksFile';
import { Query } from './Query';

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(queryFile: OptionalTasksFile) {
        if (!queryFile) {
            return '';
        }
        const instructions = [
            // Instructions are listed in the order that items are displayed in Tasks search results
            this.instruction(queryFile, 'tasks_query_explain', 'explain', ''),
            this.instruction(queryFile, 'tasks_query_short_mode', 'short mode', 'full mode'),
            this.showAndHide(queryFile, 'tasks_query_show_tree', 'tree'),

            // Fields that appear before date values:
            this.showAndHide(queryFile, 'tasks_query_show_tags', 'tags'),
            this.showAndHide(queryFile, 'tasks_query_show_id', 'id'),
            this.showAndHide(queryFile, 'tasks_query_show_depends_on', 'depends on'),
            this.showAndHide(queryFile, 'tasks_query_show_priority', 'priority'),
            this.showAndHide(queryFile, 'tasks_query_show_recurrence_rule', 'recurrence rule'),
            this.showAndHide(queryFile, 'tasks_query_show_on_completion', 'on completion'),

            // Date fields:
            this.showAndHide(queryFile, 'tasks_query_show_created_date', 'created date'),
            this.showAndHide(queryFile, 'tasks_query_show_start_date', 'start date'),
            this.showAndHide(queryFile, 'tasks_query_show_scheduled_date', 'scheduled date'),
            this.showAndHide(queryFile, 'tasks_query_show_due_date', 'due date'),
            this.showAndHide(queryFile, 'tasks_query_show_cancelled_date', 'cancelled date'),
            this.showAndHide(queryFile, 'tasks_query_show_done_date', 'done date'),

            // Elements of query results:
            this.showAndHide(queryFile, 'tasks_query_show_urgency', 'urgency'),
            this.showAndHide(queryFile, 'tasks_query_show_backlink', 'backlink'),
            this.showAndHide(queryFile, 'tasks_query_show_edit_button', 'edit button'),
            this.showAndHide(queryFile, 'tasks_query_show_postpone_button', 'postpone button'),
            this.showAndHide(queryFile, 'tasks_query_show_task_count', 'task count'),

            // Extra instructions
            this.addValue(queryFile, 'tasks_query_extra_instructions'),
        ];
        return instructions.filter((i) => i !== '').join('\n');
    }

    private instruction(queryFile: TasksFile, prop: string, trueValue: string, falseValue: string) {
        return (queryFile.hasProperty(prop) && (queryFile.property(prop) ? trueValue : falseValue)) || '';
    }

    private showAndHide(queryFile: TasksFile, prop: string, field: string) {
        return this.instruction(queryFile, prop, 'show ' + field, 'hide ' + field);
    }

    private addValue(queryFile: TasksFile, prop: string) {
        return queryFile.hasProperty(prop) ? queryFile.property(prop) || '' : '';
    }

    public query(queryFile: OptionalTasksFile) {
        return new Query(this.source(queryFile), queryFile);
    }

    /**
     * Return text that creates MetaBind widgets for users to edit query file defaults.
     */
    public metaBindPluginWidgets() {
        // This is initially hard-coded, though I intend to machine-generate it eventually.
        // Its text is embedded in the test vault and in the user guide.
        return `
short mode: \`INPUT[toggle:tasks_query_short_mode]\`
tree: \`INPUT[toggle:tasks_query_show_tree]\`
tags: \`INPUT[toggle:tasks_query_show_tags]\`
id: \`INPUT[toggle:tasks_query_show_id]\` depends on: \`INPUT[toggle:tasks_query_show_depends_on]\`
priority: \`INPUT[toggle:tasks_query_show_priority]\`
recurrence rule: \`INPUT[toggle:tasks_query_show_recurrence_rule]\` on completion: \`INPUT[toggle:tasks_query_show_on_completion]\`
start date: \`INPUT[toggle:tasks_query_show_start_date]\` scheduled date: \`INPUT[toggle:tasks_query_show_scheduled_date]\` due date: \`INPUT[toggle:tasks_query_show_due_date]\`
created date: \`INPUT[toggle:tasks_query_show_created_date]\` cancelled date: \`INPUT[toggle:tasks_query_show_cancelled_date]\` done date: \`INPUT[toggle:tasks_query_show_done_date]\`
urgency: \`INPUT[toggle:tasks_query_show_urgency]\`
backlink: \`INPUT[toggle:tasks_query_show_backlink]\`
edit button: \`INPUT[toggle:tasks_query_show_edit_button]\` postpone button: \`INPUT[toggle:tasks_query_show_postpone_button]\`
task count: \`INPUT[toggle:tasks_query_show_task_count]\`
extra instructions: \`INPUT[textArea:tasks_query_extra_instructions]\`
explain: \`INPUT[toggle:tasks_query_explain]\`
`;
    }
}
