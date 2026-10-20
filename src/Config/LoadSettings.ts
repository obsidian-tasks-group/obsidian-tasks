import type { TasksEvents } from '../Obsidian/TasksEvents';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import { log, logging } from '../lib/logging';
import { GlobalFilter } from './GlobalFilter';
import { GlobalQuery } from './GlobalQuery';
import { getSettings, updateSettings } from './Settings';
import { StatusSettings } from './StatusSettings';

/**
 * Store the settings read from data.json, and pass them on to the objects that keep their own copy.
 *
 * Anything that keeps its own copy of a setting must be updated here,
 * or changes made to data.json while Obsidian is running will not reach it.
 */
export function applySettingsData(data: any) {
    updateSettings(data);

    // Fetch the updated settings, in case the user has not yet edited the settings,
    // in which case data is currently empty.
    const newSettings = getSettings();
    GlobalFilter.getInstance().set(newSettings.globalFilter);
    GlobalFilter.getInstance().setRemoveGlobalFilter(newSettings.removeGlobalFilter);
    GlobalQuery.getInstance().set(newSettings.globalQuery);
    StatusSettings.applyToStatusRegistry(newSettings.statusSettings, StatusRegistry.getInstance());
}

/**
 * Re-read data.json after it changed on disk, for example after Obsidian Sync or a git pull,
 * and refresh everything that depends on the settings.
 */
export async function reloadSettingsFromDisk(loadData: () => Promise<any>, events: TasksEvents | undefined) {
    let data;
    try {
        data = await loadData();
    } catch (error) {
        // For example, an external editor saved a partial edit, so data.json is not valid JSON.
        // Keep the current settings: Obsidian calls this again when the file next changes.
        log('warn', `Ignoring change to data.json, as it could not be loaded: ${error}`);
        return;
    }
    applySettingsData(data);
    logging.configure(getSettings().loggingOptions);

    // How tasks are read depends on the settings, so re-read the whole vault,
    // and re-run open queries, which can use the global query and presets.
    events?.triggerReloadVault();
    events?.triggerReloadOpenSearchResults();
}
