import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';

import query_file_defaults_all_options_null from '../Obsidian/__test_data__/query_file_defaults_all_options_null.json';
import { QueryFileDefaults } from '../../src/Query/QueryFileDefaults';

function generateQueryFileDefaultsSource(data: any) {
    const tasksFile = getTasksFileFromMockData(data);
    return new QueryFileDefaults().source(tasksFile);
}

describe('QueryFileDefaults', () => {
    it('should give empty query if no relevant properties present', () => {
        const data = query_file_defaults_all_options_null;
        const source = generateQueryFileDefaultsSource(data);
        expect(source).toEqual('');
    });
});
