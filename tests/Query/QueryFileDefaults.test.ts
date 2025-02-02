import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';

import query_file_defaults_all_options_null from '../Obsidian/__test_data__/query_file_defaults_all_options_null.json';
import { QueryFileDefaults } from '../../src/Query/QueryFileDefaults';

describe('QueryFileDefaults', () => {
    it('should give empty query if no relevant properties present', () => {
        const tasksFile = getTasksFileFromMockData(query_file_defaults_all_options_null);
        const source = new QueryFileDefaults().source(tasksFile);
        expect(source).toEqual('');
    });
});
