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
        expect(generateQueryFileDefaultsSource(query_file_defaults_all_options_false)).toMatchInlineSnapshot(
            '"full mode"',
        );
    });

    it('should generate instructions - all values true', () => {
        expect(generateQueryFileDefaultsSource(query_file_defaults_all_options_true)).toMatchInlineSnapshot(
            '"short mode"',
        );
    });
});
