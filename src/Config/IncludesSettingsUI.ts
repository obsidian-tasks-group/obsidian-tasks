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

    public async saveIncludesSettings(
        updatedIncludes: IncludesMap,
        _plugin: TasksPlugin,
        settings: Settings,
        refreshView: RefreshViewCallback | null,
    ) {
        await saveIncludesSettings(updatedIncludes, this.plugin, settings, refreshView);
    }
}

export async function saveIncludesSettings(
    updatedIncludes: IncludesMap,
    plugin: TasksPlugin,
    settings: Settings,
    refreshView: (() => void) | null,
) {
    // Update the settings in storage
    updateSettings({ includes: updatedIncludes });
    await plugin.saveSettings();

    // Update the local settings object to reflect the changes
    settings.includes = { ...updatedIncludes };

    // Refresh the view if a callback was provided
    if (refreshView) {
        refreshView();
    }
}
