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

    describe('IncludesSettingsService - validateIncludeName', () => {
        function expectIsValid(result: { isValid: boolean; errorMessage: string | null }) {
            expect(result.isValid).toBe(true);
            expect(result.errorMessage).toBe(null);
        }

        function expectIsNotValid(result: { isValid: boolean; errorMessage: string | null }, errorMessage: string) {
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe(errorMessage);
        }

        it('should recognise valid new name', () => {
            expectIsValid(service.validateIncludeName(testIncludes, 'key1', 'new-name'));
        });

        it('should reject an empty new name', () => {
            const result = service.validateIncludeName(testIncludes, 'key1', '');
            expectIsNotValid(result, 'Include name cannot be empty or all whitespace');
        });

        it('should reject an new name with only whitespaces', () => {
            const result = service.validateIncludeName(testIncludes, 'key1', ' \t');
            expectIsNotValid(result, 'Include name cannot be empty or all whitespace');
        });

        it('should reject a new name if it already exists', () => {
            const result = service.validateIncludeName(testIncludes, 'key1', 'key2');
            expectIsNotValid(result, 'An include with this name already exists');
        });

        it('should treat renaming to self as valid', () => {
            expectIsValid(service.validateIncludeName(testIncludes, 'key1', 'key1'));
        });
    });

    describe('IncludesSettingsService - addInclude', () => {
        it('should add a new include with a unique key', () => {
            const result = service.addInclude(testIncludes);

            expect(result.newKey).toBe('new_key_1');
            expect(result.includes['new_key_1']).toBe('');
            expect(Object.keys(result.includes).length).toBe(3);
        });
    });

    describe('IncludesSettingsService - renameInclude', () => {
        it('should rename a key and preserve order', () => {
            const result = service.renameInclude(testIncludes, 'key1', 'newName');

            expect(result).not.toBeNull();
            expect(Object.keys(result!)[0]).toBe('newName');
            expect(result!['newName']).toBe('value1');
            expect(Object.keys(result!).length).toBe(2);
        });

        it('should trim spaces from a unique new name', () => {
            const result = service.renameInclude(testIncludes, 'key2', '  renamed_key2  ');

            expect(result).not.toBeNull();
            expect(Object.keys(result!)[1]).toBe('renamed_key2');
            expect(result!['renamed_key2']).toBe('value2');
            expect(Object.keys(result!).length).toBe(2);
        });

        it('should return null for duplicate keys', () => {
            const result = service.renameInclude(testIncludes, 'key1', 'key2');

            expect(result).toBeNull();
        });

        it('should return null for empty new key', () => {
            const result = service.renameInclude(testIncludes, 'key1', '');

            expect(result).toBeNull();
        });

        it('should return null for empty key containing only whitespace', () => {
            const result = service.renameInclude(testIncludes, 'key1', '\t ');

            expect(result).toBeNull();
        });
    });

    describe('IncludesSettingsService - deleteInclude', () => {
        it('should remove a key', () => {
            const result = service.deleteInclude(testIncludes, 'key1');

            expect(Object.keys(result).length).toBe(1);
            expect(result['key1']).toBeUndefined();
            expect(result['key2']).toBe('value2');
        });
    });

    describe('IncludesSettingsService - updateIncludeValue', () => {
        it('should update the value of an include', () => {
            const result = service.updateIncludeValue(testIncludes, 'key1', 'new value');

            expect(result['key1']).toBe('new value');
        });
    });

    describe('IncludesSettingsService - wouldCreateDuplicateKey', () => {
        let service: IncludesSettingsService;
        let testIncludes: IncludesMap;

        beforeEach(() => {
            service = new IncludesSettingsService();
            testIncludes = {
                key1: 'value1',
                key2: 'value2',
                'key with spaces': 'value3',
            };
        });

        // Basic functionality tests

        it('should return false when renaming a key to itself', () => {
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'key1')).toBe(false);
        });

        it('should return true when new name matches an existing key', () => {
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'key2')).toBe(true);
        });

        it('should return false when new name does not match any existing key', () => {
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'uniqueKey')).toBe(false);
        });

        // Tests for the trimming logic

        it('should return false when renaming a key to itself but with different whitespace', () => {
            // This tests the first trim() call - comparing original key (trimmed) with new key
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', '  key1  ')).toBe(false);
        });

        it('should return true when new name matches an existing key after trimming', () => {
            // This tests the second trim() call - comparing existing keys (trimmed) with new key
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', '  key2  ')).toBe(true);
        });

        it('should normalize both new key and existing keys by trimming whitespace', () => {
            // Add a key with leading/trailing whitespace to the includes map
            const includesWithSpacedKey = {
                ...testIncludes,
                '  spacedKey  ': 'value4',
            };

            // Should detect when we try to rename to a key that matches after trimming
            expect(service.wouldCreateDuplicateKey(includesWithSpacedKey, 'key1', 'spacedKey')).toBe(true);
        });

        it('should normalize the proposed new name before comparison', () => {
            // We're renaming 'key1' to '  key1  ' which should be considered the same key after trimming
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', '  key1  ')).toBe(false);
        });

        it('should identify a rename as non-duplicate when only whitespace differs', () => {
            // Should be considered the same key (not a duplicate)
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1  ', '  key1')).toBe(false);
        });

        it('should not consider keys the same if there are actual differences beyond whitespace', () => {
            // Add a key with a similar name
            const extendedIncludes = {
                ...testIncludes,
                key1a: 'value3',
            };

            // Should NOT consider 'key1' and 'key1a' the same after trimming
            expect(service.wouldCreateDuplicateKey(extendedIncludes, 'key1', '  key1a  ')).toBe(true);
            expect(service.wouldCreateDuplicateKey(extendedIncludes, 'key1  ', '  key1a')).toBe(true);
        });

        // Tests for the conditional logic

        it('should ignore the key being renamed when checking for duplicates', () => {
            // This tests the existingKey !== keyBeingRenamed check
            // We're renaming 'key1' to 'uniqueKey', and checking that 'key1' isn't considered a duplicate
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'uniqueKey')).toBe(false);
        });

        it('should detect duplicates with spaces in the keys', () => {
            // Should detect a duplicate when the existing key has spaces
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'key with spaces')).toBe(true);
        });

        // Edge cases

        it('should handle empty keys appropriately', () => {
            // Should not detect a duplicate when the empty key doesn't exist
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', '')).toBe(false);

            const includesWithEmptyKey = {
                ...testIncludes,
                '': 'empty value',
            };

            // Should detect when we try to rename to an empty key that already exists
            expect(service.wouldCreateDuplicateKey(includesWithEmptyKey, 'key1', '')).toBe(true);
        });

        it('should handle keys containing only whitespace', () => {
            const includesWithWhitespaceKey = {
                ...testIncludes,
                '   ': 'whitespace value',
            };

            // Should detect when we try to rename to a whitespace-only key that matches after trimming
            expect(service.wouldCreateDuplicateKey(includesWithWhitespaceKey, 'key1', '  ')).toBe(true);

            // Should handle comparing empty string (after trim) with whitespace-only key
            expect(service.wouldCreateDuplicateKey(includesWithWhitespaceKey, '   ', 'newKey')).toBe(false);
        });

        it('should handle case sensitivity correctly', () => {
            // Keys should be case-sensitive
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'Key2')).toBe(false);
            expect(service.wouldCreateDuplicateKey(testIncludes, 'key1', 'KEY2')).toBe(false);
        });

        it('should handle special characters in keys', () => {
            const includesWithSpecialChars = {
                ...testIncludes,
                'special!@#': 'special value',
            };

            // Should detect a duplicate with special characters
            expect(service.wouldCreateDuplicateKey(includesWithSpecialChars, 'key1', 'special!@#')).toBe(true);

            // Should not detect a duplicate with slightly different special characters
            expect(service.wouldCreateDuplicateKey(includesWithSpecialChars, 'key1', 'special!@')).toBe(false);
        });
    });
});
