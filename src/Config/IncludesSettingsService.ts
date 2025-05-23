import { renameKeyInRecordPreservingOrder } from '../lib/RecordHelpers';
import type { IncludesMap } from './Settings';

/**
 * Represents a map of include keys and their current values
 * used during validation
 */
export interface RenamesInProgress {
    [originalName: string]: string;
}

export class RenameResult {
    public readonly originalName: string;
    public readonly isValid: boolean;
    public readonly errorMessage: string | null;

    constructor(originalName: string, isValid: boolean, errorMessage: string | null) {
        this.originalName = originalName;
        this.isValid = isValid;
        this.errorMessage = errorMessage;
    }
}

/**
 * Result of validating multiple include values at once
 */
export interface RenameResults {
    [originalName: string]: RenameResult;
}

export class IncludesSettingsService {
    /**
     * Validates multiple include names against each other
     * @param renames Map of original keys to their current values in UI
     * @returns Object mapping each key to its validation result
     */
    public validateRenames(renames: RenamesInProgress): RenameResults {
        const results: RenameResults = {};

        // Check each key against all others
        for (const [originalName, newName] of Object.entries(renames)) {
            const includesWithOtherPendingRenames: IncludesMap = {};

            for (const [otherOriginalName, otherNewName] of Object.entries(renames)) {
                // Skip the name being validated to avoid false duplicate matches.
                if (otherOriginalName !== originalName) {
                    includesWithOtherPendingRenames[otherNewName] = '';
                }
            }

            // Pass empty string as keyBeingRenamed since we're not excluding any key from duplicate check
            results[originalName] = this.validateRename(includesWithOtherPendingRenames, '', newName);
        }

        return results;
    }

    /**
     * Validates if an include name is valid
     * @param includes The current includes map
     * @param keyBeingRenamed The key being renamed
     * @param newName The proposed name to validate
     * @returns An object with validation result and error message if any
     */
    public validateRename(includes: Readonly<IncludesMap>, keyBeingRenamed: string, newName: string): RenameResult {
        // Check for empty name
        if (!newName || newName.trim() === '') {
            return new RenameResult(keyBeingRenamed, false, 'Include name cannot be empty or all whitespace');
        }

        for (const existingKey of Object.keys(includes)) {
            // Skip the key being renamed
            if (existingKey === keyBeingRenamed) {
                continue;
            }

            if (existingKey.trim() === newName.trim()) {
                return new RenameResult(keyBeingRenamed, false, 'An include with this name already exists');
            }
        }

        return new RenameResult(keyBeingRenamed, true, null);
    }

    /**
     * Adds a new include to the map with a unique key
     * @param includes The current includes map (will not be modified)
     * @returns An object with the updated includes map and the new key
     */
    public addInclude(includes: Readonly<IncludesMap>): { includes: IncludesMap; newKey: string } {
        const newKey = this.generateUniqueKey(includes);
        const newIncludes = { ...includes };
        newIncludes[newKey] = '';
        return {
            includes: newIncludes,
            newKey,
        };
    }

    /**
     * Renames a key in the includes map, preserving order
     * @param includes The current includes map (will not be modified)
     * @param keyBeingRenamed The existing key that would be renamed
     * @param proposedNewName The new name being considered
     * @returns The updated includes map, or null if the operation failed (for example, duplicate key)
     */
    public renameInclude(
        includes: Readonly<IncludesMap>,
        keyBeingRenamed: string,
        proposedNewName: string,
    ): IncludesMap | null {
        // Validate inputs
        if (!proposedNewName || proposedNewName.trim() === '') {
            return null; // Empty keys are not allowed
        }

        proposedNewName = proposedNewName.trim();

        // Check if this would create a duplicate
        if (this.wouldCreateDuplicateKey(includes, keyBeingRenamed, proposedNewName)) {
            return null;
        }

        return renameKeyInRecordPreservingOrder(includes, keyBeingRenamed, proposedNewName);
    }

    /**
     * Deletes an include from the map
     * @param includes The current includes map (will not be modified)
     * @param key The key to delete
     * @returns The updated includes map
     */
    public deleteInclude(includes: Readonly<IncludesMap>, key: string): IncludesMap {
        const newIncludes = { ...includes };
        delete newIncludes[key];
        return newIncludes;
    }

    /**
     * Updates the value of an include
     * @param includes The current includes map (will not be modified)
     * @param key The key to update
     * @param value The new value
     * @returns The updated includes map
     */
    public updateIncludeValue(includes: Readonly<IncludesMap>, key: string, value: string): IncludesMap {
        const newIncludes = { ...includes };
        newIncludes[key] = value;
        return newIncludes;
    }

    /**
     * Checks if renaming a key would create a duplicate in the includes map
     * @param includes The includes map to check against
     * @param keyBeingRenamed The existing key that would be renamed
     * @param proposedNewName The new name being considered
     * @returns True if the proposed new name would conflict with an existing key
     */
    public wouldCreateDuplicateKey(
        includes: Readonly<IncludesMap>,
        keyBeingRenamed: string,
        proposedNewName: string,
    ): boolean {
        // Normalize the proposedNewName once
        const normalizedNewName = proposedNewName.trim();

        // If it's the same key (after trimming), it's not a duplicate
        if (keyBeingRenamed.trim() === normalizedNewName) {
            return false;
        }

        // Check against all existing keys
        for (const existingKey of Object.keys(includes)) {
            // Skip the key being renamed (exact reference check)
            if (existingKey !== keyBeingRenamed && existingKey.trim() === normalizedNewName) {
                return true; // Found a duplicate
            }
        }

        return false;
    }

    /**
     * Generates a unique key for a new include
     * @param includes The current includes map
     * @returns A unique key string
     */
    private generateUniqueKey(includes: Readonly<IncludesMap>): string {
        const baseKey = 'new_key';
        let suffix = 1;
        while (Object.prototype.hasOwnProperty.call(includes, `${baseKey}_${suffix}`)) {
            suffix++;
        }
        return `${baseKey}_${suffix}`;
    }
}
