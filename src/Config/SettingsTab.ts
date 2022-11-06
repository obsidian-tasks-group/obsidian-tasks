import { PluginSettingTab, Setting } from 'obsidian';
import type TasksPlugin from '../main';
import { getSettings, updateSettings } from './Settings';

export class SettingsTab extends PluginSettingTab {
    private readonly plugin: TasksPlugin;

    constructor({ plugin }: { plugin: TasksPlugin }) {
        super(plugin.app, plugin);

        this.plugin = plugin;
    }

    private static createFragmentWithHTML = (html: string) =>
        createFragment((documentFragment) => (documentFragment.createDiv().innerHTML = html));

    public display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // For reasons I don't understand, 'h2' is tiny in Settings,
        // so I have used 'h3' as the largest heading.
        containerEl.createEl('h3', { text: 'Tasks Settings' });
        containerEl.createEl('p', {
            cls: 'tasks-setting-important',
            text: 'Changing any settings requires a restart of obsidian.',
        });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Global filter Settings' });
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName('Global task filter')
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    '<p><b>Recommended: Leave empty if you want all checklist items in your vault to be tasks managed by this plugin.</b></p>' +
                        '<p>Use a global filter if you want Tasks to only act on a subset of your "<code>- [ ]</code>" checklist items, so that ' +
                        'a checklist item must include the specified string in its description in order to be considered a task.<p>' +
                        '<p>For example, if you set the global filter to <code>#task</code>, the Tasks plugin will only handle checklist items tagged with <code>#task</code>.</br>' +
                        'Other checklist items will remain normal checklist items and not appear in queries or get a done date set.</p>' +
                        '<p>See the <a href="https://obsidian-tasks-group.github.io/obsidian-tasks/getting-started/global-filter/">documentation</a>.</p>',
                ),
            )
            .addText((text) => {
                const settings = getSettings();

                // I wanted to make this say 'for example, #task or TODO'
                // but wasn't able to figure out how to make the text box
                // wide enough for the whole string to be visible.
                text.setPlaceholder('e.g. #task or TODO')
                    .setValue(settings.globalFilter)
                    .onChange(async (value) => {
                        updateSettings({ globalFilter: value });

                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Remove global filter from description')
            .setDesc(
                'Enabling this removes the string that you set as global filter from the task description when displaying a task.',
            )
            .addToggle((toggle) => {
                const settings = getSettings();

                toggle.setValue(settings.removeGlobalFilter).onChange(async (value) => {
                    updateSettings({ removeGlobalFilter: value });

                    await this.plugin.saveSettings();
                });
            });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Date Settings' });
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName('Set done date on every completed task')
            .setDesc('Enabling this will add a timestamp ✅ YYYY-MM-DD at the end when a task is toggled to done')
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.setDoneDate).onChange(async (value) => {
                    updateSettings({ setDoneDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Use filename as Scheduled date for undated tasks')
            .setDesc(
                SettingsTab.createFragmentWithHTML(
                    'Save time entering Scheduled (⏳) dates.</br>' +
                        'If this option is enabled, any undated tasks will be given a default Scheduled date extracted from their file name.</br>' +
                        'The date in the file name must be in one of <code>YYYY-MM-DD</code> or <code>YYYYMMDD</code> formats.</br>' +
                        'Undated tasks have none of Due (📅 ), Scheduled (⏳) and Start (🛫) dates.</br>' +
                        '<p>See the <a href="https://obsidian-tasks-group.github.io/obsidian-tasks/getting-started/use-filename-as-default-date/">documentation</a>.</p>',
                ),
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.useFilenameAsScheduledDate).onChange(async (value) => {
                    updateSettings({ useFilenameAsScheduledDate: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Folders with default Scheduled dates')
            .setDesc(
                'Leave empty if you want to use default Scheduled dates everywhere, or enter a comma-separated list of folders.',
            )
            .addText(async (input) => {
                const settings = getSettings();
                await this.plugin.saveSettings();
                input
                    .setValue(SettingsTab.renderFolderArray(settings.filenameAsDateFolders))
                    .onChange(async (value) => {
                        const folders = SettingsTab.parseCommaSeparatedFolders(value);
                        updateSettings({ filenameAsDateFolders: folders });
                        await this.plugin.saveSettings();
                    });
            });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Auto-suggest Settings' });
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName('Auto-suggest task content')
            .setDesc('Enabling this will open an intelligent suggest menu while typing inside a recognized task line.')
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.autoSuggestInEditor).onChange(async (value) => {
                    updateSettings({ autoSuggestInEditor: value });
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Minimum match length for auto-suggest')
            .setDesc(
                'If higher than 0, auto-suggest will be triggered only when the beginning of any supported keywords is recognized.',
            )
            .addSlider((slider) => {
                const settings = getSettings();
                slider
                    .setLimits(0, 3, 1)
                    .setValue(settings.autoSuggestMinMatch)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMinMatch: value });
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Maximum number of auto-suggestions to show')
            .setDesc(
                'How many suggestions should be shown when an auto-suggest menu pops up (including the "⏎" option).',
            )
            .addSlider((slider) => {
                const settings = getSettings();
                slider
                    .setLimits(3, 12, 1)
                    .setValue(settings.autoSuggestMaxItems)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        updateSettings({ autoSuggestMaxItems: value });
                        await this.plugin.saveSettings();
                    });
            });

        // ---------------------------------------------------------------------------
        containerEl.createEl('h4', { text: 'Dialog Settings' });
        // ---------------------------------------------------------------------------

        new Setting(containerEl)
            .setName('Provide access keys in dialogs')
            .setDesc(
                'If the access keys (keyboard shortcuts) for various controls' +
                    ' in dialog boxes conflict with system keyboard shortcuts' +
                    ' or assistive technology functionality that is important for you,' +
                    ' you may want to deactivate them here.',
            )
            .addToggle((toggle) => {
                const settings = getSettings();
                toggle.setValue(settings.provideAccessKeys).onChange(async (value) => {
                    updateSettings({ provideAccessKeys: value });
                    await this.plugin.saveSettings();
                });
            });
    }

    private static parseCommaSeparatedFolders(input: string): string[] {
        return (
            input
                // a limitation is that folder names may not contain commas
                .split(',')
                .map((folder) => folder.trim())
                // remove leading and trailing slashes
                .map((folder) => folder.replace(/^\/|\/$/g, ''))
                .filter((folder) => folder !== '')
        );
    }

    private static renderFolderArray(folders: string[]): string {
        return folders.join(',');
    }
}
