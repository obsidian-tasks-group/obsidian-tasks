import {
    PresetsSettingsService,
    RenameResult,
    type RenamesInProgress,
} from '../../../src/Query/Presets/PresetsSettingsService';
import type { PresetsMap } from '../../../src/Query/Presets/Presets';

function expectToBeValid(result: RenameResult) {
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBe(null);
}

function expectToGiveError(result: RenameResult, errorMessage: string) {
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe(errorMessage);
}

describe('PresetsSettingsService', () => {
    let service: PresetsSettingsService;
    let testPresets: PresetsMap;

    beforeEach(() => {
        service = new PresetsSettingsService();
        testPresets = {
            key1: 'value1',
            key2: 'value2',
        };
    });

    describe('PresetsSettingsService - validateMultipleIncludeNames', () => {
        let service: PresetsSettingsService;

        beforeEach(() => {
            service = new PresetsSettingsService();
        });

        it('should validate all keys as valid when there are no duplicates', () => {
            const keyMap: RenamesInProgress = {
                original_key_1: 'unique_value_1',
                original_key_2: 'unique_value_2',
                original_key_3: 'unique_value_3',
            };

            const result = service.validateRenames(keyMap);

            expectToBeValid(result['original_key_1']);
            expectToBeValid(result['original_key_2']);
            expectToBeValid(result['original_key_3']);
        });

        it('should mark duplicate keys as invalid', () => {
            const keyMap: RenamesInProgress = {
                original_key_1: 'duplicate_value',
                original_key_2: 'duplicate_value', // Duplicate
                original_key_3: 'unique_value',
            };

            const result = service.validateRenames(keyMap);

            expectToGiveError(result['original_key_1'], 'A preset with this name already exists');
            expectToGiveError(result['original_key_2'], 'A preset with this name already exists');
            expectToBeValid(result['original_key_3']);
        });

        it('should mark names differing only in whitespace as identical', () => {
            const keyMap: RenamesInProgress = {
                original_key_1: 'duplicate_value',
                original_key_2: 'duplicate_value  ', // Duplicate
                original_key_3: 'unique_value',
            };

            const result = service.validateRenames(keyMap);

            expectToGiveError(result['original_key_1'], 'A preset with this name already exists');
            expectToGiveError(result['original_key_2'], 'A preset with this name already exists');
            expectToBeValid(result['original_key_3']);
        });

        it('should mark empty keys as invalid', () => {
            const keyMap: RenamesInProgress = {
                original_key_1: '',
                original_key_2: '  ', // Whitespace only
                original_key_3: 'valid_key',
            };

            const result = service.validateRenames(keyMap);

            expectToGiveError(result['original_key_1'], 'Preset name cannot be empty or all whitespace');
            expectToGiveError(result['original_key_2'], 'Preset name cannot be empty or all whitespace');
            expectToBeValid(result['original_key_3']);
        });

        it('should handle the case when all keys are identical', () => {
            const keyMap: RenamesInProgress = {
                original_key_1: 'same_value',
                original_key_2: 'same_value',
                original_key_3: 'same_value',
            };

            const result = service.validateRenames(keyMap);

            // None should be valid
            const validCount = Object.values(result).filter((r) => r.isValid).length;
            expect(validCount).toBe(0);
        });
    });

    describe('PresetsSettingsService - validateRename', () => {
        it('should recognise valid new name', () => {
            expectToBeValid(service.validateRename(testPresets, 'key1', 'new-name'));
        });

        it('should reject an empty new name', () => {
            const result = service.validateRename(testPresets, 'key1', '');
            expectToGiveError(result, 'Preset name cannot be empty or all whitespace');
        });

        it('should reject an new name with only whitespaces', () => {
            const result = service.validateRename(testPresets, 'key1', ' \t');
            expectToGiveError(result, 'Preset name cannot be empty or all whitespace');
        });

        it('should reject a new name if it already exists', () => {
            const result = service.validateRename(testPresets, 'key1', 'key2');
            expectToGiveError(result, 'A preset with this name already exists');
        });

        it('should reject a new name if it already exists, without ending spaces', () => {
            const result = service.validateRename(testPresets, 'key1', 'key2  ');
            expectToGiveError(result, 'A preset with this name already exists');
        });

        it('should reject a new name if it already exists, with surrounding spaces', () => {
            testPresets = {
                key1: 'value1',
                ' key2 ': 'value2',
            };

            const result = service.validateRename(testPresets, 'key1', 'key2');
            expectToGiveError(result, 'A preset with this name already exists');
        });

        it('should treat renaming to self as valid', () => {
            expectToBeValid(service.validateRename(testPresets, 'key1', 'key1'));
        });
    });

    describe('PresetsSettingsService - addPreset', () => {
        it('should add a new include with a unique key', () => {
            const result = service.addPreset(testPresets);

            expect(result.newKey).toBe('new_key_1');
            expect(result.presets['new_key_1']).toBe('');
            expect(Object.keys(result.presets).length).toBe(3);
        });
    });

    describe('PresetsSettingsService - renamePreset', () => {
        it('should rename a key and preserve order', () => {
            const result = service.renamePreset(testPresets, 'key1', 'newName');

            expect(result).not.toBeNull();
            expect(Object.keys(result!)[0]).toBe('newName');
            expect(result!['newName']).toBe('value1');
            expect(Object.keys(result!).length).toBe(2);
        });

        it('should trim spaces from a unique new name', () => {
            const result = service.renamePreset(testPresets, 'key2', '  renamed_key2  ');

            expect(result).not.toBeNull();
            expect(Object.keys(result!)[1]).toBe('renamed_key2');
            expect(result!['renamed_key2']).toBe('value2');
            expect(Object.keys(result!).length).toBe(2);
        });

        it('should return null for duplicate keys', () => {
            const result = service.renamePreset(testPresets, 'key1', 'key2');

            expect(result).toBeNull();
        });

        it('should return null for empty new key', () => {
            const result = service.renamePreset(testPresets, 'key1', '');

            expect(result).toBeNull();
        });

        it('should return null for empty key containing only whitespace', () => {
            const result = service.renamePreset(testPresets, 'key1', '\t ');

            expect(result).toBeNull();
        });
    });

    describe('PresetsSettingsService - deletePreset', () => {
        it('should remove a key', () => {
            const result = service.deletePreset(testPresets, 'key1');

            expect(Object.keys(result).length).toBe(1);
            expect(result['key1']).toBeUndefined();
            expect(result['key2']).toBe('value2');
        });
    });

    describe('PresetsSettingsService - updateIncludeValue', () => {
        it('should update the value of an include', () => {
            const result = service.updatePresetValue(testPresets, 'key1', 'new value');

            expect(result['key1']).toBe('new value');
        });
    });

    describe('PresetsSettingsService - wouldCreateDuplicateKey', () => {
        let service: PresetsSettingsService;
        let testIncludes: PresetsMap;

        beforeEach(() => {
            service = new PresetsSettingsService();
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
            // Add a key with leading/trailing whitespace to the presets map
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

    describe('PresetsSettingsService - reorderPreset', () => {
        let service: PresetsSettingsService;
        let testIncludes: PresetsMap;

        beforeEach(() => {
            service = new PresetsSettingsService();
            testIncludes = {
                first: 'value1',
                second: 'value2',
                third: 'value3',
                fourth: 'value4',
                fifth: 'value5',
            };
        });

        it('should move an item to a new position', () => {
            // Move 'fourth' to position 1 (second position, 0-indexed)
            const result = service.reorderPreset(testIncludes, 'fourth', 1);

            expect(result).not.toBeNull();
            const keys = Object.keys(result!);
            expect(keys).toEqual(['first', 'fourth', 'second', 'third', 'fifth']);
        });

        it('should move an item from beginning to end', () => {
            // Move 'first' to the last position
            const result = service.reorderPreset(testIncludes, 'first', 4);

            expect(result).not.toBeNull();
            const keys = Object.keys(result!);
            expect(keys).toEqual(['second', 'third', 'fourth', 'fifth', 'first']);
        });

        it('should move an item from end to beginning', () => {
            // Move 'fifth' to the first position
            const result = service.reorderPreset(testIncludes, 'fifth', 0);

            expect(result).not.toBeNull();
            const keys = Object.keys(result!);
            expect(keys).toEqual(['fifth', 'first', 'second', 'third', 'fourth']);
        });

        it('should return null for invalid key', () => {
            const result = service.reorderPreset(testIncludes, 'nonexistent', 1);
            expect(result).toBeNull();
        });

        it('should return null for invalid target position (negative)', () => {
            const result = service.reorderPreset(testIncludes, 'second', -1);
            expect(result).toBeNull();
        });

        it('should return null for invalid target position (too high)', () => {
            const result = service.reorderPreset(testIncludes, 'second', 10);
            expect(result).toBeNull();
        });

        it('should handle moving to the same position (no change)', () => {
            // 'third' is currently at index 2, move it to index 2
            const result = service.reorderPreset(testIncludes, 'third', 2);

            expect(result).not.toBeNull();
            const keys = Object.keys(result!);
            expect(keys).toEqual(['first', 'second', 'third', 'fourth', 'fifth']);
        });

        it('should handle complex reordering correctly', () => {
            // Move 'second' (index 1) to index 3
            const result = service.reorderPreset(testIncludes, 'second', 3);

            expect(result).not.toBeNull();
            const keys = Object.keys(result!);
            expect(keys).toEqual(['first', 'third', 'fourth', 'second', 'fifth']);
        });
    });
});
