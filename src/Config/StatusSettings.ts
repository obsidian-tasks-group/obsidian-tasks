import { StatusConfiguration } from '../Status';
import type { StatusRegistry } from '../StatusRegistry';

/**
 * Class for encapsulating the settings that control custom statuses.
 *
 * Most methods are static to allow them to be called from call-backs.
 *
 * @see Status
 */
export class StatusSettings {
    constructor() {
        this.customStatusTypes = []; // Do not modify directly: use the static mutation methods in this class.
    }
    customStatusTypes: StatusConfiguration[];

    /**
     * Add a new custom status.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * - Currently, duplicates are allowed.
     * - Allows empty StatusConfiguration objects - where every string is empty
     * @param statusSettings
     * @param newStatus
     */
    public static addCustomStatus(statusSettings: StatusSettings, newStatus: StatusConfiguration) {
        statusSettings.customStatusTypes.push(newStatus);
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
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * @param statusSettings
     * @param status
     */
    public static deleteCustomStatus(statusSettings: StatusSettings, status: StatusConfiguration) {
        const index = statusSettings.customStatusTypes.indexOf(status);
        if (index <= -1) {
            return false;
        }
        statusSettings.customStatusTypes.splice(index, 1);
        return true;
    }

    /**
     * Add a collection of custom supported statuses to a StatusSettings.
     * This can be used to quickly populate the user's settings.
     * If there are any exact duplicates already present, they are skipped, and noted in the returned value.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * @param statusSettings a StatusSettings
     * @param supportedStatuses - an array of status specifications, for example `['b', 'Bookmark', 'x']`
     * @return An array of warning messages to show the user, one for each rejected exact duplicate status.
     *
     * @see {@link minimalSupportedStatuses}, {@link itsSupportedStatuses}
     */
    public static bulkAddStatusCollection(
        statusSettings: StatusSettings,
        supportedStatuses: Array<[string, string, string]>,
    ): string[] {
        const notices: string[] = [];
        supportedStatuses.forEach((importedStatus) => {
            const hasStatus = statusSettings.customStatusTypes.find((element) => {
                return (
                    element.indicator == importedStatus[0] &&
                    element.name == importedStatus[1] &&
                    element.nextStatusIndicator == importedStatus[2]
                );
            });
            if (!hasStatus) {
                StatusSettings.addCustomStatus(
                    statusSettings,
                    new StatusConfiguration(importedStatus[0], importedStatus[1], importedStatus[2], false),
                );
            } else {
                notices.push(`The status ${importedStatus[1]} (${importedStatus[0]}) is already added.`);
            }
        });
        return notices;
    }

    public static applyToStatusRegistry(statusSettings: StatusSettings, statusRegistry: StatusRegistry) {
        // Reset the registry as this may also come from a settings add/delete.
        statusRegistry.clearStatuses();
        statusSettings.customStatusTypes.forEach((statusType) => {
            statusRegistry.add(statusType);
        });
        console.log(statusSettings.customStatusTypes);
        console.log(statusRegistry.registeredStatuses);
    }
}
