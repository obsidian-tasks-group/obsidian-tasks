/* This file contains re-usable functions for use in managing and editing
 * user settings for custom task statuses.
 * It intentionally does not import any Obsidian types, so that tests can
 * be written for its contents.
 */
import { StatusConfiguration } from '../Status';

/**
 * Add a collection of of supported statuses to an existing collection of StatusConfiguration objects.
 * This can be used to quickly populate the user's settings.
 * If there are any exact duplicates already present, they are skipped, and noted in the returned value.
 *
 * @param supportedStatuses - an array of status specifications, for example `['b', 'Bookmark', 'x']`
 * @param statusTypes {@link StatusConfiguration} - an array of existing known statuses
 * @return An array of warning messages to show the user, one for each rejected exact duplicate status.
 *
 */
export function addCustomStatusesCollection(
    supportedStatuses: Array<[string, string, string]>,
    statusTypes: StatusConfiguration[],
): string[] {
    const notices: string[] = [];
    supportedStatuses.forEach((importedStatus) => {
        const hasStatus = statusTypes.find((element) => {
            return (
                element.indicator == importedStatus[0] &&
                element.name == importedStatus[1] &&
                element.nextStatusIndicator == importedStatus[2]
            );
        });
        if (!hasStatus) {
            statusTypes.push(new StatusConfiguration(importedStatus[0], importedStatus[1], importedStatus[2], false));
        } else {
            notices.push(`The status ${importedStatus[1]} (${importedStatus[0]}) is already added.`);
        }
    });
    return notices;
}
