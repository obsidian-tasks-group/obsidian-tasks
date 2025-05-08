import type { IncludesMap } from './Settings';

export class IncludesSettingsService {
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
