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
     * Checks if a new key would create a duplicate in the includes map
     * @param includes The current includes map (will not be modified)
     * @param originalKey The original key (to exclude from comparison)
     * @param newKey The new key to check
     * @returns True if the key would be a duplicate, false otherwise
     */
    public isDuplicateKey(includes: Readonly<IncludesMap>, originalKey: string, newKey: string): boolean {
        // Check if it's the same as the original key (after trimming)
        if (originalKey === newKey) {
            return false; // Same key, not a duplicate
        }

        // Check against all existing keys
        for (const existingKey of Object.keys(includes)) {
            // Skip the original key
            if (existingKey !== originalKey && existingKey === newKey) {
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
    private generateUniqueKey(includes: IncludesMap): string {
        const baseKey = 'new_key';
        let suffix = 1;
        while (Object.prototype.hasOwnProperty.call(includes, `${baseKey}_${suffix}`)) {
            suffix++;
        }
        return `${baseKey}_${suffix}`;
    }
}
