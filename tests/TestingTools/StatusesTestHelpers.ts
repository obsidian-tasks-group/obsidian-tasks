import type { StatusCollection, StatusCollectionEntry } from '../../src/Statuses/StatusCollection';
import { StatusSettings } from '../../src/Config/StatusSettings';
import { Status } from '../../src/Statuses/Status';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';

export const coreStatusesData: StatusCollection = [
    [' ', 'Todo', 'x', 'TODO'],
    ['x', 'Done', ' ', 'DONE'],
];

export function createStatuses(
    coreStatusesData: Array<StatusCollectionEntry>,
    customStatusesData: Array<StatusCollectionEntry>,
) {
    // Populate StatusSettings:
    const statusSettings = new StatusSettings();

    const core = statusSettings.coreStatuses;
    StatusSettings.replaceStatus(core, core[0], Status.createFromImportedValue(coreStatusesData[0]));
    StatusSettings.replaceStatus(core, core[1], Status.createFromImportedValue(coreStatusesData[1]));

    StatusSettings.deleteAllCustomStatuses(statusSettings);
    customStatusesData.forEach((entry: StatusCollectionEntry) => {
        StatusSettings.addStatus(statusSettings.customStatuses, Status.createFromImportedValue(entry));
    });

    // Populate StatusRegistry:
    const statusRegistry = new StatusRegistry();
    StatusSettings.applyToStatusRegistry(statusSettings, statusRegistry);
    return { statusSettings, statusRegistry };
}

export function constructStatuses(importedStatuses: StatusCollection) {
    const statuses: Status[] = [];
    importedStatuses.forEach((importedStatus) => {
        statuses.push(Status.createFromImportedValue(importedStatus));
    });
    return statuses;
}
