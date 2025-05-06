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
