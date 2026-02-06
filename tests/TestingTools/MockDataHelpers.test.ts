import { AllMockDataNames } from '../Obsidian/AllCacheSampleData';
import { listPathAndData } from './MockDataHelpers';

describe('MockDataHelpers', () => {
    it('should give the path to the Markdown file', () => {
        const allSamples = listPathAndData(AllMockDataNames);
        const firstSample = allSamples[0];
        expect(firstSample[0]).toBe('Test Data/all_link_types.md');
    });
});
