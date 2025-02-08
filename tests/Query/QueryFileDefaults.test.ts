import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';

import query_file_defaults_all_options_false from '../Obsidian/__test_data__/query_file_defaults_all_options_false.json';
import query_file_defaults_all_options_null from '../Obsidian/__test_data__/query_file_defaults_all_options_null.json';
import query_file_defaults_all_options_true from '../Obsidian/__test_data__/query_file_defaults_all_options_true.json';
import { QueryFileDefaults } from '../../src/Query/QueryFileDefaults';

function generateQueryFileDefaultsSource(data: any) {
    const tasksFile = getTasksFileFromMockData(data);
    return new QueryFileDefaults().source(tasksFile);
}

describe('QueryFileDefaults', () => {
    it('should treat the TasksFile as optional', () => {
        expect(new QueryFileDefaults().source(undefined)).toEqual('');
    });

    it('should give empty query if no relevant properties present', () => {
        expect(generateQueryFileDefaultsSource(query_file_defaults_all_options_null)).toEqual('');
    });

    it('should give the property names in original order', () => {
        const names = new QueryFileDefaults().allPropertyNames();
        expect(names).toMatchInlineSnapshot(`
            [
              "TQ_explain",
              "TQ_short_mode",
              "TQ_show_tree",
              "TQ_show_tags",
              "TQ_show_id",
              "TQ_show_depends_on",
              "TQ_show_priority",
              "TQ_show_recurrence_rule",
              "TQ_show_on_completion",
              "TQ_show_created_date",
              "TQ_show_start_date",
              "TQ_show_scheduled_date",
              "TQ_show_due_date",
              "TQ_show_cancelled_date",
              "TQ_show_done_date",
              "TQ_show_urgency",
              "TQ_show_backlink",
              "TQ_show_edit_button",
              "TQ_show_postpone_button",
              "TQ_show_task_count",
              "TQ_extra_instructions",
            ]
        `);
    });

    it('should give the property names in sorted order', () => {
        const names = new QueryFileDefaults().allPropertyNamesSorted();
        expect(names).toMatchInlineSnapshot(`
            [
              "TQ_explain",
              "TQ_extra_instructions",
              "TQ_short_mode",
              "TQ_show_backlink",
              "TQ_show_cancelled_date",
              "TQ_show_created_date",
              "TQ_show_depends_on",
              "TQ_show_done_date",
              "TQ_show_due_date",
              "TQ_show_edit_button",
              "TQ_show_id",
              "TQ_show_on_completion",
              "TQ_show_postpone_button",
              "TQ_show_priority",
              "TQ_show_recurrence_rule",
              "TQ_show_scheduled_date",
              "TQ_show_start_date",
              "TQ_show_tags",
              "TQ_show_task_count",
              "TQ_show_tree",
              "TQ_show_urgency",
            ]
        `);
    });

    it('should provide a known property type', () => {
        expect(new QueryFileDefaults().propertyType('TQ_show_tree')).toEqual('checkbox');
    });

    it('should provide an unknown property type as undefined', () => {
        expect(new QueryFileDefaults().propertyType('TQ_any_old_property')).toBeUndefined();
    });

    it('should generate instructions - all values false', () => {
        expect(generateQueryFileDefaultsSource(query_file_defaults_all_options_false)).toMatchInlineSnapshot(`
            "full mode
            hide tree
            hide tags
            hide id
            hide depends on
            hide priority
            hide recurrence rule
            hide on completion
            hide created date
            hide start date
            hide scheduled date
            hide due date
            hide cancelled date
            hide done date
            hide urgency
            hide backlink
            hide edit button
            hide postpone button
            hide task count
            # press shift-return to add new lines
            not done"
        `);
    });

    it('should generate instructions - all values true', () => {
        expect(generateQueryFileDefaultsSource(query_file_defaults_all_options_true)).toMatchInlineSnapshot(`
            "explain
            short mode
            show tree
            show tags
            show id
            show depends on
            show priority
            show recurrence rule
            show on completion
            show created date
            show start date
            show scheduled date
            show due date
            show cancelled date
            show done date
            show urgency
            show backlink
            show edit button
            show postpone button
            show task count
            # press shift-return to add new lines
            not done"
        `);
    });
});
