import { TestDataLoader } from './TestDataLoader';

import one_task from './__test_data__/one_task.json';

describe('TestDataLoader', () => {
    it('should return data for a known file', () => {
        const readFromFile = TestDataLoader.get('one_task');

        expect(readFromFile).toStrictEqual(one_task);
    });

    it('should provide the path to the JSON file', () => {
        const path = TestDataLoader.path('code_block_in_task');
        const expectedSubPath = 'tests/Obsidian/__test_data__/code_block_in_task.json';

        expect(path).toContain(expectedSubPath);
        expect(path.endsWith(expectedSubPath)).toBe(true);
    });

    it('should provide path to the Markdown file in the test vault', () => {
        const path = TestDataLoader.markdownPath('query_using_properties');
        expect(path).toEqual('Test Data/query_using_properties.md');
    });
});
