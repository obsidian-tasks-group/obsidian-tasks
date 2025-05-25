import { Setting, TextAreaComponent } from 'obsidian';
import type TasksPlugin from '../main';
import type { TasksEvents } from '../Obsidian/TasksEvents';
import { IncludesSettingsService, type RenamesInProgress } from './IncludesSettingsService';
import { type IncludesMap, type Settings, getSettings, updateSettings } from './Settings';

type RefreshViewCallback = () => void;

/**
 * Manages the user interface for configuring includes settings in the Tasks plugin.
 *
 * This class handles rendering, updating, and managing the includes settings UI components.
 */
export class IncludesSettingsUI {
    private readonly plugin: TasksPlugin;
    private readonly events: TasksEvents;
    private readonly includesSettingsService = new IncludesSettingsService();
    private readonly nameFields: Map<string, { inputEl: HTMLInputElement; originalKey: string }> = new Map();

    /**
     * Creates a new instance of IncludesSettingsUI
     * @param plugin The Tasks plugin instance
     * @param events The plugin's events object
     */
    constructor(plugin: TasksPlugin, events: TasksEvents) {
        this.plugin = plugin;
        this.events = events;
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

            // Clear the input map when re-rendering
            this.nameFields.clear();

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

            // Store reference to this input with its original key
            this.nameFields.set(key, { inputEl: text.inputEl, originalKey: key });

            let newKey = key;

            text.inputEl.addEventListener('input', (e) => {
                newKey = (e.target as HTMLInputElement).value;

                // Validate all inputs to update any that might be affected
                this.validateAllInputs();
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

        // TODO Add reorder button or facility to drag and drop items

        // Add delete button
        setting.addExtraButton((btn) => {
            btn.extraSettingsEl.addClass('tasks-includes-delete-button');
            btn.setIcon('cross')
                .setTooltip('Delete')
                .onClick(async () => {
                    const updatedIncludes = this.includesSettingsService.deleteInclude(settings.includes, key);
                    await this.saveIncludesSettings(updatedIncludes, settings, refreshView);
                });
        });

        // We are not providing any information about this setting, so delete it to prevent
        // using up screen width.
        setting.infoEl.remove();
    }

    /**
     * Validates all input elements and updates their styling
     */
    private validateAllInputs() {
        // Build the current key-value map for validation
        const currentValues: RenamesInProgress = {};

        this.nameFields.forEach(({ inputEl, originalKey }) => {
            currentValues[originalKey] = inputEl.value;
        });

        // Get validation results from the service
        const validationResults = this.includesSettingsService.validateRenames(currentValues);

        // Apply styling based on validation results
        this.nameFields.forEach(({ inputEl, originalKey }) => {
            const result = validationResults[originalKey];

            if (result && !result.isValid) {
                inputEl.addClass('has-error');

                // Optionally, you could add a title attribute to show the error message on hover
                inputEl.title = result.errorMessage ?? '';
            } else {
                inputEl.removeClass('has-error');
                inputEl.title = '';
            }
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
        // TODO Consider how this relates to the validation code - should it refuse to save settings if validation fails?
        // Update the settings in storage
        updateSettings({ includes: updatedIncludes });
        await this.plugin.saveSettings();

        // Update the local settings object to reflect the changes
        settings.includes = { ...updatedIncludes };

        // Refresh the view if a callback was provided
        if (refreshView) {
            refreshView();
        }

        this.events.triggerReloadOpenSearchResults();
    }
}
