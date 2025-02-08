import type { OptionalTasksFile, TasksFile } from '../Scripting/TasksFile';
import { Query } from './Query';

// Enum for handler types
enum Handler {
    Instruction = 'instruction',
    ShowAndHide = 'showAndHide',
}

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(queryFile: OptionalTasksFile) {
        if (!queryFile) {
            return '';
        }

        // Instructions are listed in the order that items are displayed in Tasks search results
        // TODO Migrate all properties to this storage:
        const queryProperties = [
            {
                name: 'tasks_query_explain',
                display: 'explain',
                handler: Handler.Instruction,
                trueValue: 'explain',
                falseValue: '',
            },
            {
                name: 'tasks_query_short_mode',
                display: 'short mode',
                handler: Handler.Instruction,
                trueValue: 'short mode',
                falseValue: 'full mode',
            },
            {
                name: 'tasks_query_show_tree',
                display: 'tree',
                handler: Handler.ShowAndHide,
            },

            // Fields that appear before date values:
            {
                name: 'tasks_query_show_tags',
                display: 'tags',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_id',
                display: 'id',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_depends_on',
                display: 'depends on',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_priority',
                display: 'priority',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_recurrence_rule',
                display: 'recurrence rule',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_on_completion',
                display: 'on completion',
                handler: Handler.ShowAndHide,
            },

            // Date fields:
            {
                name: 'tasks_query_show_created_date',
                display: 'created date',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_start_date',
                display: 'start date',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_scheduled_date',
                display: 'scheduled date',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_due_date',
                display: 'due date',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_cancelled_date',
                display: 'cancelled date',
                handler: Handler.ShowAndHide,
            },
            {
                name: 'tasks_query_show_done_date',
                display: 'done date',
                handler: Handler.ShowAndHide,
            },
        ];

        const instructions = [
            ...queryProperties.map((prop) => this.generateInstruction(queryFile, prop)),

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

    private generateInstruction(queryFile: TasksFile, prop: any) {
        switch (prop.handler) {
            case Handler.Instruction:
                return this.instruction(queryFile, prop.name, prop.trueValue, prop.falseValue);
            case Handler.ShowAndHide:
                return this.showAndHide(queryFile, prop.name, prop.display);
            default:
                throw new Error('Unknown handler type: ' + prop.handler + '.');
        }
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
