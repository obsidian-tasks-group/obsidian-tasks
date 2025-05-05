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
});
