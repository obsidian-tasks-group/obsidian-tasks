import type { Pos } from 'obsidian';

import { getTasksFileFromMockData } from '../../TestingTools/MockDataHelpers';
import query_file_defaults_all_options_null from '../../Obsidian/__test_data__/query_file_defaults_all_options_null.json';
import query_file_defaults_all_options_true from '../../Obsidian/__test_data__/query_file_defaults_all_options_true.json';

function extractFrontmatter(data: any) {
    const queryFile = getTasksFileFromMockData(data);
    const pos: Pos | undefined = queryFile.cachedMetadata.frontmatterPosition;
    return data.fileContents.slice(pos?.start.offset ?? 0, pos?.end.offset ?? 0);
}

describe('QueryFileDefaults', () => {
    it('supported-properties-empty', () => {
        expect(extractFrontmatter(query_file_defaults_all_options_null)).toMatchInlineSnapshot(`
            "---
            tasks_query_explain:
            tasks_query_short_mode:
            tasks_query_show_tree:
            tasks_query_show_tags:
            tasks_query_show_id:
            tasks_query_show_depends_on:
            tasks_query_show_priority:
            tasks_query_show_recurrence_rule:
            tasks_query_show_on_completion:
            tasks_query_show_created_date:
            tasks_query_show_start_date:
            tasks_query_show_scheduled_date:
            tasks_query_show_due_date:
            tasks_query_show_cancelled_date:
            tasks_query_show_done_date:
            tasks_query_show_urgency:
            tasks_query_show_backlink:
            tasks_query_show_edit_button:
            tasks_query_show_postpone_button:
            tasks_query_show_task_count:
            tasks_query_extra_instructions:
            ---"
        `);
    });

    it('supported-properties-empty', () => {
        expect(extractFrontmatter(query_file_defaults_all_options_true)).toMatchInlineSnapshot(`
            "---
            tasks_query_explain: true
            tasks_query_short_mode: true
            tasks_query_show_tree: true
            tasks_query_show_tags: true
            tasks_query_show_id: true
            tasks_query_show_depends_on: true
            tasks_query_show_priority: true
            tasks_query_show_recurrence_rule: true
            tasks_query_show_on_completion: true
            tasks_query_show_created_date: true
            tasks_query_show_start_date: true
            tasks_query_show_scheduled_date: true
            tasks_query_show_due_date: true
            tasks_query_show_cancelled_date: true
            tasks_query_show_done_date: true
            tasks_query_show_urgency: true
            tasks_query_show_backlink: true
            tasks_query_show_edit_button: true
            tasks_query_show_postpone_button: true
            tasks_query_show_task_count: true
            tasks_query_extra_instructions: |-
              # press shift-return to add new lines
              not done
            ---"
        `);
    });
});
