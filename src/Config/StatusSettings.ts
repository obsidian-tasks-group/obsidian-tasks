import type { StatusConfiguration } from '../Statuses/StatusConfiguration';
import type { StatusRegistry } from '../Statuses/StatusRegistry';
import { Status } from '../Statuses/Status';
import type { StatusCollection } from '../Statuses/StatusCollection';

/**
 * Class for encapsulating the settings that control custom statuses.
 *
 * There are two lists of {@link StatusConfiguration} objects:
 *
 * - {@link coreStatuses} - which will always have two values in.
 * - {@link customStatuses} - which starts two values, but these can be deleted and more added.
 *
 * Most methods are static to allow them to be called from call-backs.
 *
 * Use {@link applyToStatusRegistry} to apply these settings to a {@link StatusRegistry}
 *
 * @see Status
 */
export class StatusSettings {
    constructor() {
        this.coreStatuses = [
            // The two statuses that do not need CSS styling
            Status.makeTodo().configuration,
            Status.makeDone().configuration,
        ]; // Do not modify directly: use the static mutation methods in this class.
        this.customStatuses = [
            // Any statuses that are always supported, but need custom CSS styling
            Status.makeInProgress().configuration,
            Status.makeCancelled().configuration,
        ]; // Do not modify directly: use the static mutation methods in this class.
    }
    readonly coreStatuses: StatusConfiguration[];
    readonly customStatuses: StatusConfiguration[];

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
        statusSettings.customStatuses.splice(0);
    }

    /**
     * Restore the default custom statuses.
     *
     * @param statusSettings
     */
    public static resetAllCustomStatuses(statusSettings: StatusSettings) {
        StatusSettings.deleteAllCustomStatuses(statusSettings);
        const defaultSettings = new StatusSettings();
        defaultSettings.customStatuses.forEach((s) => {
            StatusSettings.addStatus(statusSettings.customStatuses, s);
        });
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
            const hasStatus = statusSettings.customStatuses.find((element) => {
                return (
                    element.symbol == importedStatus[0] &&
                    element.name == importedStatus[1] &&
                    element.nextStatusSymbol == importedStatus[2]
                );
            });
            if (!hasStatus) {
                StatusSettings.addStatus(statusSettings.customStatuses, Status.createFromImportedValue(importedStatus));
            } else {
                notices.push(`The status ${importedStatus[1]} (${importedStatus[0]}) is already added.`);
            }
        });
        return notices;
    }

    /**
     * Retun a list of all the statuses in the settings - first the core ones, then the custom ones.
     * @param statusSettings
     */
    public static allStatuses(statusSettings: StatusSettings) {
        return statusSettings.coreStatuses.concat(statusSettings.customStatuses);
    }

    /**
     * Apply the custom statuses in the statusSettings object to the statusRegistry.
     * @param statusSettings
     * @param statusRegistry
     */
    public static applyToStatusRegistry(statusSettings: StatusSettings, statusRegistry: StatusRegistry) {
        statusRegistry.clearStatuses();
        StatusSettings.allStatuses(statusSettings).forEach((statusType) => {
            statusRegistry.add(statusType);
        });
    }
}
