import { AllTestDataNames, allCacheSampleData } from '../Obsidian/AllCacheSampleData';
import { listPathAndData, listPathAndDataRaw } from './MockDataHelpers';

describe('MockDataHelpers', () => {
    it('should list all test file paths - version 1', () => {
        const allSamples = listPathAndDataRaw(allCacheSampleData());
        const firstSample = allSamples[0];
        expect(firstSample[0]).toBe('Test Data/all_link_types.md');
    });

    it.failing('should list all test file paths - version 2', () => {
        const allSamples = listPathAndData(AllTestDataNames);
        const firstSample = allSamples[0];
        // Gives '/Users/clare/.../obsidian-tasks/tests/Obsidian/__test_data__/all_link_types.json'
        expect(firstSample[0]).toBe('Test Data/all_link_types.md');
    });
});
