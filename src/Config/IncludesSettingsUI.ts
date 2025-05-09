import { Setting, TextAreaComponent } from 'obsidian';
import type TasksPlugin from '../main';
import { IncludesSettingsService } from './IncludesSettingsService';
import { type IncludesMap, type Settings, getSettings, updateSettings } from './Settings';

type RefreshViewCallback = () => void;

/**
 * Manages the user interface for configuring includes settings in the Tasks plugin.
 *
 * This class handles rendering, updating, and managing the includes settings UI components.
 */
export class IncludesSettingsUI {
    private readonly plugin: TasksPlugin;
    private readonly includesSettingsService = new IncludesSettingsService();

    /**
     * Creates a new instance of IncludesSettingsUI
     * @param plugin The Tasks plugin instance
     */
    constructor(plugin: TasksPlugin) {
        this.plugin = plugin;
    }

    /**
     * Renders the includes settings interface in the specified container
     * @param containerEl The HTML element to render the settings interface in
     */
    public renderIncludesSettings(containerEl: HTMLElement) {
        const includesContainer = containerEl.createDiv();
        const settings = getSettings();

        const renderIncludes = () => {
            includesContainer.empty();

            Object.entries(settings.includes).forEach(([key, value]) => {
                this.renderIncludeItem(includesContainer, settings, key, value, renderIncludes);
            });
        };

        renderIncludes();

        this.createAddNewIncludeButton(containerEl, settings, renderIncludes);
    }

    /**
     * Renders a single include item with its controls
     * @param includesContainer The container element for the include item
     * @param settings The current plugin settings
     * @param key The key/name of the include
     * @param value The value/query of the include
     * @param refreshView Callback to refresh the view after changes
     */
    private renderIncludeItem(
        includesContainer: HTMLDivElement,
        settings: Settings,
        key: string,
        value: string,
        refreshView: RefreshViewCallback,
    ) {
        const wrapper = includesContainer.createDiv({ cls: 'tasks-includes-wrapper' });
        const setting = new Setting(wrapper);
        setting.settingEl.addClass('tasks-includes-setting');

        // Add name input field
        setting.addText((text) => {
            text.setPlaceholder('Name').setValue(key);
            text.inputEl.addClass('tasks-includes-key');

            let newKey = key;

            text.inputEl.addEventListener('input', (e) => {
                newKey = (e.target as HTMLInputElement).value;
            });

            // Handle renaming an include
            const commitRename = async () => {
                if (newKey && newKey !== key) {
                    const updatedIncludes = this.includesSettingsService.renameInclude(settings.includes, key, newKey);
                    if (updatedIncludes) {
                        await this.saveIncludesSettings(updatedIncludes, settings, refreshView);
                    }
                }
            };

            text.inputEl.addEventListener('blur', commitRename);
            text.inputEl.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    text.inputEl.blur(); // trigger blur handler
                }
            });
        });

        // Add value textarea
        setting.addTextArea((textArea) => {
            textArea.inputEl.addClass('tasks-includes-value');
            textArea.setPlaceholder('Query or filter text...').setValue(value);

            this.setupAutoResizingTextarea(textArea);

            return textArea.onChange(async (newValue) => {
                const updatedIncludes = this.includesSettingsService.updateIncludeValue(
                    settings.includes,
                    key,
                    newValue,
                );
                await this.saveIncludesSettings(updatedIncludes, settings, null);
            });
        });

        // Add delete button
        setting.addExtraButton((btn) => {
            btn.setIcon('cross')
                .setTooltip('Delete')
                .onClick(async () => {
                    const updatedIncludes = this.includesSettingsService.deleteInclude(settings.includes, key);
                    await this.saveIncludesSettings(updatedIncludes, settings, refreshView);
                });
        });
    }

    /**
     * Sets up auto-resizing behaviour for a textarea component
     * @param textArea The textarea component to configure
     */
    private setupAutoResizingTextarea(textArea: TextAreaComponent) {
        const resize = () => {
            textArea.inputEl.style.height = 'auto'; // reset first
            textArea.inputEl.style.height = `${textArea.inputEl.scrollHeight}px`;
        };

        // Initial resize
        resize();

        // Resize on input
        textArea.inputEl.addEventListener('input', resize);
    }

    /**
     * Creates and configures the "Add new include" button
     * @param containerEl The container element for the button
     * @param settings The current plugin settings
     * @param refreshView Callback to refresh the view after adding a new include
     */
    private createAddNewIncludeButton(containerEl: HTMLElement, settings: Settings, refreshView: RefreshViewCallback) {
        new Setting(containerEl).addButton((btn) => {
            btn.setButtonText('Add new include')
                .setCta()
                .onClick(async () => {
                    const { includes: updatedIncludes } = this.includesSettingsService.addInclude(settings.includes);
                    await this.saveIncludesSettings(updatedIncludes, settings, refreshView);
                });
        });
    }

    /**
     * Updates settings with new includes and refreshes UI if needed
     * @param updatedIncludes The new includes map
     * @param settings The current settings object to update
     * @param refreshView Callback to refresh the view (pass null if no refresh is needed)
     */
    private async saveIncludesSettings(
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
