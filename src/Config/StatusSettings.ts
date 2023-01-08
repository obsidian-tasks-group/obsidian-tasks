import type { StatusConfiguration } from '../Status';

export class StatusSettings {
    constructor() {
        this.customStatusTypes = [];
    }
    customStatusTypes: StatusConfiguration[];

    /**
     * Add a new custom status.
     *
     * - Currently, duplicates are allowed.
     * @param newStatus
     */
    public addCustomStatus(newStatus: StatusConfiguration) {
        this.customStatusTypes.push(newStatus);
    }

    /**
     * Replace the given status, to effectively edit it.
     * Returns true if the settings were changed.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * - Does not currently check whether the status character is the same
     * - If the status character is different, does not check whether the new one is already used in another status
     * @param statusSettings
     * @param originalStatus
     * @param newStatus
     */
    public static replaceCustomStatus(
        statusSettings: StatusSettings,
        originalStatus: StatusConfiguration,
        newStatus: StatusConfiguration,
    ): boolean {
        const index = statusSettings.customStatusTypes.indexOf(originalStatus);
        if (index <= -1) {
            return false;
        }
        statusSettings.customStatusTypes.splice(index, 1, newStatus);
        return true;
    }

    /**
     * Delete the given custom status.
     * Returns true if deleted, and false if not.
     * @param status
     */
    public deleteCustomStatus(status: StatusConfiguration) {
        const index = this.customStatusTypes.indexOf(status);
        if (index <= -1) {
            return false;
        }
        this.customStatusTypes.splice(index, 1);
        return true;
    }
}
