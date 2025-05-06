import { IncludesSettingsService } from '../../src/Config/IncludesSettingsService';
import type { IncludesMap } from '../../src/Config/Settings';

describe('IncludesSettingsService', () => {
    let service: IncludesSettingsService;
    let testIncludes: IncludesMap;

    beforeEach(() => {
        service = new IncludesSettingsService();
        testIncludes = {
            key1: 'value1',
            key2: 'value2',
        };
    });

    it('should add a new include with a unique key', () => {
        const result = service.addInclude(testIncludes);

        expect(result.newKey).toBe('new_key_1');
        expect(result.includes['new_key_1']).toBe('');
        expect(Object.keys(result.includes).length).toBe(3);
    });

    it('should detect duplicates', () => {
        // Checks if a new key would create a duplicate in the includes map
        expect(service.isDuplicateKey(testIncludes, 'key1', 'key2')).toBe(true);
        expect(service.isDuplicateKey(testIncludes, 'key1', 'key3')).toBe(false);
        expect(service.isDuplicateKey(testIncludes, 'key1', 'key1')).toBe(false);
        expect(service.isDuplicateKey(testIncludes, ' key1 ', 'key1')).toBe(false); // Trim test
        expect(service.isDuplicateKey(testIncludes, 'key1', ' key2 ')).toBe(true); // Trim test
    });
});
