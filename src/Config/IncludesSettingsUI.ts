import type TasksPlugin from '../main';
import { IncludesSettingsService } from './IncludesSettingsService';

export class IncludesSettingsUI {
    // @ts-expect-error: plugin unused
    private readonly plugin: TasksPlugin;

    constructor(plugin: TasksPlugin) {
        this.plugin = plugin;
    }

    public readonly includesSettingsService = new IncludesSettingsService();
}
