import type TasksPlugin from '../main';
import { IncludesSettingsService } from './IncludesSettingsService';
import { type IncludesMap, type Settings, updateSettings } from './Settings';

export type RefreshViewCallback = () => void;

export class IncludesSettingsUI {
    private readonly plugin: TasksPlugin;
    public readonly includesSettingsService = new IncludesSettingsService();

    constructor(plugin: TasksPlugin) {
        this.plugin = plugin;
    }

    /**
     * Updates settings with new includes and refreshes UI if needed
     * @param updatedIncludes The new includes map
     * @param settings The current settings object to update
     * @param refreshView Callback to refresh the view (pass null if no refresh is needed)
     */
    public async saveIncludesSettings(
        updatedIncludes: IncludesMap,
        settings: Settings,
        refreshView: RefreshViewCallback | null,
    ) {
        // Update the settings in storage
        updateSettings({ includes: updatedIncludes });
        await this.plugin.saveSettings();

        // Update the local settings object to reflect the changes
        settings.includes = { ...updatedIncludes };

        // Refresh the view if a callback was provided
        if (refreshView) {
            refreshView();
        }
    }
}
