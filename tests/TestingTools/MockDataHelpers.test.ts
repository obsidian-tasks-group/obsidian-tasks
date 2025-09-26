import { AllTestDataNames } from '../Obsidian/AllCacheSampleData';
import { listPathAndData } from './MockDataHelpers';

describe('MockDataHelpers', () => {
    it('should list all test file paths - version 2', () => {
        const allSamples = listPathAndData(AllTestDataNames);
        const firstSample = allSamples[0];
        expect(firstSample[0]).toBe('Test Data/all_link_types.md');
    });
});
