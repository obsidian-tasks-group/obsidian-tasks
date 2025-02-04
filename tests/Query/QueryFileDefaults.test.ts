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
