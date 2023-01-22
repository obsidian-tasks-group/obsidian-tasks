import type { StatusConfiguration } from '../StatusConfiguration';
import type { StatusRegistry } from '../StatusRegistry';
import { Status } from '../Status';
import type { StatusCollection } from '../StatusCollection';

/**
 * Class for encapsulating the settings that control custom statuses.
 *
 * Most methods are static to allow them to be called from call-backs.
 *
 * @see Status
 */
export class StatusSettings {
    constructor() {
        this.coreStatusTypes = [
            // The two statuses that do not need CSS styling
            Status.makeTodo().configuration,
            Status.makeDone().configuration,
        ]; // Do not modify directly: use the static mutation methods in this class.
        this.customStatusTypes = [
            // Any statuses that are always supported, but need custom CSS styling
            Status.makeInProgress().configuration,
            Status.makeCancelled().configuration,
        ]; // Do not modify directly: use the static mutation methods in this class.
    }
    readonly coreStatusTypes: StatusConfiguration[]; // TODO - need to handle if this was not present in settings read from disk
    readonly customStatusTypes: StatusConfiguration[];

    /**
     * Add a new custom status.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * - Currently, duplicates are allowed.
     * - Allows empty StatusConfiguration objects - where every string is empty
     * @param statuses
     * @param newStatus
     */
    public static addStatus(statuses: StatusConfiguration[], newStatus: StatusConfiguration) {
        statuses.push(newStatus);
    }

    /**
     * Replace the given status, to effectively edit it.
     * Returns true if the settings were changed.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * - Does not currently check whether the status character is the same
     * - If the status character is different, does not check whether the new one is already used in another status
     * @param statuses
     * @param originalStatus
     * @param newStatus
     */
    public static replaceStatus(
        statuses: StatusConfiguration[],
        originalStatus: StatusConfiguration,
        newStatus: StatusConfiguration,
    ): boolean {
        const index = this.findStatusIndex(originalStatus, statuses);
        if (index <= -1) {
            return false;
        }
        statuses.splice(index, 1, newStatus);
        return true;
    }

    /**
     * This is a workaround for the fact that statusSettings.customStatusTypes.indexOf(statusConfiguration)
     * stopped finding identical statuses since the addition of StatusConfiguration.type.
     * @param statusConfiguration
     * @param statuses
     * @private
     */
    private static findStatusIndex(statusConfiguration: StatusConfiguration, statuses: StatusConfiguration[]) {
        const originalStatusAsStatus = new Status(statusConfiguration);
        return statuses.findIndex((s) => {
            return new Status(s).previewText() == originalStatusAsStatus.previewText();
        });
    }

    /**
     * Delete the given status.
     * Returns true if deleted, and false if not.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * @param statuses
     * @param status
     */
    public static deleteStatus(statuses: StatusConfiguration[], status: StatusConfiguration) {
        const index = this.findStatusIndex(status, statuses);
        if (index <= -1) {
            return false;
        }
        statuses.splice(index, 1);
        return true;
    }

    /**
     * Delete all custom statuses.
     *
     * This is static so that it can be called from modal onClick() call-backs.
     *
     * @param statusSettings
     */
    public static deleteAllCustomStatuses(statusSettings: StatusSettings) {
        statusSettings.customStatusTypes.splice(0);
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
        supportedStatuses: StatusCollection,
    ): string[] {
        const notices: string[] = [];
        supportedStatuses.forEach((importedStatus) => {
            const hasStatus = statusSettings.customStatusTypes.find((element) => {
                return (
                    element.symbol == importedStatus[0] &&
                    element.name == importedStatus[1] &&
                    element.nextStatusSymbol == importedStatus[2]
                );
            });
            if (!hasStatus) {
                StatusSettings.addStatus(
                    statusSettings.customStatusTypes,
                    Status.createFromImportedValue(importedStatus),
                );
            } else {
                notices.push(`The status ${importedStatus[1]} (${importedStatus[0]}) is already added.`);
            }
        });
        return notices;
    }

    /**
     * Apply the custom statuses in the statusSettings object to the statusRegistry.
     * @param statusSettings
     * @param statusRegistry
     */
    public static applyToStatusRegistry(statusSettings: StatusSettings, statusRegistry: StatusRegistry) {
        statusRegistry.clearStatuses();
        statusSettings.coreStatusTypes.forEach((statusType) => {
            statusRegistry.add(statusType);
        });
        statusSettings.customStatusTypes.forEach((statusType) => {
            statusRegistry.add(statusType);
        });
    }
}
