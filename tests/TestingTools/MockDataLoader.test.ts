import one_task from '../Obsidian/__test_data__/one_task.json';
import { MockDataLoader } from './MockDataLoader';

describe('MockDataLoader', () => {
    it('should return data for a known file', () => {
        const readFromFile = MockDataLoader.get('one_task');

        expect(readFromFile).toStrictEqual(one_task);
    });

    it('should cache the results and return the same object subsequently', () => {
        const copy1 = MockDataLoader.get('code_block_in_task');
        const copy2 = MockDataLoader.get('code_block_in_task');

        expect(copy1).toBe(copy2);
    });

    it('should provide the path to the JSON file', () => {
        const path = MockDataLoader.path('code_block_in_task');
        const expectedSubPath = 'tests/Obsidian/__test_data__/code_block_in_task.json';

        expect(path).toContain(expectedSubPath);
        expect(path.endsWith(expectedSubPath)).toBe(true);
    });

    it('should provide path to the Markdown file in the test vault', () => {
        const path = MockDataLoader.markdownPath('query_using_properties');
        expect(path).toEqual('Test Data/query_using_properties.md');
    });

    it('should be able to locate loaded SimulatedFile from its CachedMetadata', () => {
        const data1 = MockDataLoader.get('yaml_tags_has_multiple_values');
        const data2 = MockDataLoader.get('yaml_tags_with_two_values_on_two_lines');

        expect(MockDataLoader.findCachedMetaData(data1.cachedMetadata)).toBe(data1);
        expect(MockDataLoader.findCachedMetaData(data2.cachedMetadata)).toBe(data2);
    });

    it('should detect CachedMetadata not previously loaded, even if it is a clone of a loaded file', () => {
        const data1 = MockDataLoader.get('one_task');

        const clonedMetadata = JSON.parse(JSON.stringify(data1.cachedMetadata));
        expect(clonedMetadata).toStrictEqual(data1.cachedMetadata);
        const t = () => {
            MockDataLoader.findCachedMetaData(clonedMetadata);
        };

        expect(t).toThrow(Error);
        expect(t).toThrowError('CachedMetadata not found in any loaded SimulatedFile');
    });

    it('should be able to locate loaded SimulatedFile from its Frontmatter', () => {
        const data1 = MockDataLoader.get('yaml_tags_has_multiple_values');
        const data2 = MockDataLoader.get('yaml_tags_with_two_values_on_two_lines');

        expect(MockDataLoader.findFrontmatter(data1.cachedMetadata.frontmatter)).toBe(data1);
        expect(MockDataLoader.findFrontmatter(data2.cachedMetadata.frontmatter)).toBe(data2);
    });
});
