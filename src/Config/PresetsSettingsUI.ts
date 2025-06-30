import { Setting, TextAreaComponent } from 'obsidian';
import type TasksPlugin from '../main';
import type { TasksEvents } from '../Obsidian/TasksEvents';
import { PresetsSettingsService, type RenamesInProgress } from '../Query/Presets/PresetsSettingsService';
import type { PresetsMap } from '../Query/Presets/Presets';
import { type Settings, getSettings, updateSettings } from './Settings';

type RefreshViewCallback = () => void;

/**
 * Manages the user interface for configuring presets settings in the Tasks plugin.
 *
 * This class handles rendering, updating, and managing the presets settings UI components.
 */
export class PresetsSettingsUI {
    private readonly plugin: TasksPlugin;
    private readonly events: TasksEvents;
    private readonly presetsSettingsService = new PresetsSettingsService();
    private readonly nameFields: Map<string, { inputEl: HTMLInputElement; originalKey: string }> = new Map();

    /**
     * Creates a new instance of PresetsSettingsUI
     * @param plugin The Tasks plugin instance
     * @param events The plugin's events object
     */
    constructor(plugin: TasksPlugin, events: TasksEvents) {
        this.plugin = plugin;
        this.events = events;
    }

    /**
     * Renders the presets settings interface in the specified container
     * @param containerEl The HTML element to render the settings interface in
     */
    public renderPresetsSettings(containerEl: HTMLElement) {
        const presetsContainer = containerEl.createDiv();
        const settings = getSettings();

        const renderPresets = () => {
            presetsContainer.empty();

            // Clear the input map when re-rendering
            this.nameFields.clear();

            Object.entries(settings.presets).forEach(([key, value]) => {
                this.renderPresetItem(presetsContainer, settings, key, value, renderPresets);
            });
        };

        renderPresets();

        this.createAddNewPresetButton(containerEl, settings, renderPresets);
    }

    /**
     * Renders a single preset item with its controls
     * @param presetsContainer The container element for the preset item
     * @param settings The current plugin settings
     * @param key The key/name of the preset
     * @param value The value/query of the preset
     * @param refreshView Callback to refresh the view after changes
     */
    private renderPresetItem(
        presetsContainer: HTMLDivElement,
        settings: Settings,
        key: string,
        value: string,
        refreshView: RefreshViewCallback,
    ) {
        const wrapper = presetsContainer.createDiv({ cls: 'tasks-presets-wrapper' });
        const setting = new Setting(wrapper);
        setting.settingEl.addClass('tasks-presets-setting');

        wrapper.setAttribute('data-preset-key', key);

        // Add name input field
        setting.addText((text) => {
            text.setPlaceholder('Name').setValue(key);
            text.inputEl.addClass('tasks-presets-key');

            // Store reference to this input with its original key
            this.nameFields.set(key, { inputEl: text.inputEl, originalKey: key });

            let newKey = key;

            text.inputEl.addEventListener('input', (e) => {
                newKey = (e.target as HTMLInputElement).value;

                // Validate all inputs to update any that might be affected
                this.validateAllInputs();
            });

            // Handle renaming a preset
            const commitRename = async () => {
                if (newKey && newKey !== key) {
                    const updatedPresets = this.presetsSettingsService.renamePreset(settings.presets, key, newKey);
                    if (updatedPresets) {
                        await this.savePresetsSettings(updatedPresets, settings, refreshView);
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
            textArea.inputEl.addClass('tasks-presets-value');
            textArea.setPlaceholder('Query or filter text...').setValue(value);

            this.setupAutoResizingTextarea(textArea);

            return textArea.onChange(async (newValue) => {
                const updatedPresets = this.presetsSettingsService.updatePresetValue(settings.presets, key, newValue);
                await this.savePresetsSettings(updatedPresets, settings, null);
            });
        });

        // Add drag handle
        setting.addExtraButton((btn) => {
            btn.extraSettingsEl.addClass('tasks-presets-drag-handle');
            btn.setIcon('grip-vertical').setTooltip('Drag to reorder');

            btn.extraSettingsEl.style.cursor = 'grab';
            btn.extraSettingsEl.addEventListener('mousedown', (_e) => {
                // Enable dragging only when mousedown starts on the handle
                wrapper.draggable = true;
                btn.extraSettingsEl.style.cursor = 'grabbing';
            });
            btn.extraSettingsEl.addEventListener('mouseup', (_e) => {
                btn.extraSettingsEl.style.cursor = 'grab';
            });
        });

        // Add delete button
        setting.addExtraButton((btn) => {
            btn.extraSettingsEl.addClass('tasks-presets-delete-button');
            btn.setIcon('cross')
                .setTooltip('Delete')
                .onClick(async () => {
                    const updatedPresets = this.presetsSettingsService.deletePreset(settings.presets, key);
                    await this.savePresetsSettings(updatedPresets, settings, refreshView);
                });
        });

        // Set up drag and drop event handlers
        this.setupDragAndDrop(wrapper, key, settings, refreshView);

        // We are not providing any information about this setting, so delete it to prevent
        // using up screen width.
        setting.infoEl.remove();
    }

    /**
     * Sets up drag and drop functionality for a preset item
     * @param wrapper The wrapper element for the preset item
     * @param key The key of the preset item
     * @param settings The current plugin settings
     * @param refreshView Callback to refresh the view after reordering
     */
    private setupDragAndDrop(
        wrapper: HTMLDivElement,
        key: string,
        settings: Settings,
        refreshView: RefreshViewCallback,
    ) {
        // Drag start
        wrapper.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', key);
                e.dataTransfer.effectAllowed = 'move';
            }
            wrapper.addClass('tasks-presets-dragging');
        });

        // Drag end
        wrapper.addEventListener('dragend', (_e) => {
            // Disable dragging after drag ends
            wrapper.draggable = false;
            wrapper.removeClass('tasks-presets-dragging');
            this.clearDropIndicators();
        });

        // Drag over
        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }

            this.showDropIndicator(wrapper, e);
        });

        // Drag leave
        wrapper.addEventListener('dragleave', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;

            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                this.clearDropIndicator(wrapper);
            }
        });

        // Drop
        wrapper.addEventListener('drop', async (e) => {
            e.preventDefault();

            const draggedKey = e.dataTransfer?.getData('text/plain');
            if (!draggedKey || draggedKey === key) {
                this.clearDropIndicators();
                return;
            }

            // Calculate drop position
            const dropPosition = this.calculateDropPosition(wrapper, e);
            const targetIndex = this.getTargetIndex(key, dropPosition);

            // Perform the reorder
            const updatedPresets = this.presetsSettingsService.reorderPreset(settings.presets, draggedKey, targetIndex);

            if (updatedPresets) {
                await this.savePresetsSettings(updatedPresets, settings, refreshView);
            }

            this.clearDropIndicators();
        });
    }

    /**
     * Gets the target index for a drop operation
     * @param targetKey The key of the element being dropped on
     * @param position Whether dropping above or below
     * @returns The target index for the reorder operation
     */
    private getTargetIndex(targetKey: string, position: 'above' | 'below'): number {
        const settings = getSettings();
        const keys = Object.keys(settings.presets);
        const targetIndex = keys.indexOf(targetKey);

        if (position === 'above') {
            return targetIndex;
        } else {
            return targetIndex + 1;
        }
    }

    /**
     * Shows a drop indicator on the target element
     * @param wrapper The wrapper element
     * @param e The drag event
     */
    private showDropIndicator(wrapper: HTMLDivElement, e: DragEvent) {
        this.clearDropIndicators();

        const dropPosition = this.calculateDropPosition(wrapper, e);
        if (dropPosition === 'above') {
            wrapper.addClass('tasks-presets-drop-above');
        } else {
            wrapper.addClass('tasks-presets-drop-below');
        }
    }

    /**
     * Calculates whether the drop should be above or below the target
     * @param wrapper The wrapper element
     * @param e The drag event
     * @returns 'above' or 'below'
     */
    private calculateDropPosition(wrapper: HTMLDivElement, e: DragEvent): 'above' | 'below' {
        const rect = wrapper.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        return e.clientY < midpoint ? 'above' : 'below';
    }

    /**
     * Clears all drop indicators
     */
    private clearDropIndicators() {
        const containers = document.querySelectorAll('.tasks-presets-wrapper');
        containers.forEach((container) => {
            this.clearDropIndicator(container as HTMLElement);
        });
    }

    /**
     * Clears drop indicator from a specific element
     * @param element The element to clear indicators from
     */
    private clearDropIndicator(element: HTMLElement) {
        element.removeClass('tasks-presets-drop-above');
        element.removeClass('tasks-presets-drop-below');
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
        const validationResults = this.presetsSettingsService.validateRenames(currentValues);

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
     * Creates and configures the "Add new preset" button
     * @param containerEl The container element for the button
     * @param settings The current plugin settings
     * @param refreshView Callback to refresh the view after adding a new preset
     */
    private createAddNewPresetButton(containerEl: HTMLElement, settings: Settings, refreshView: RefreshViewCallback) {
        new Setting(containerEl).addButton((btn) => {
            btn.setButtonText('Add new preset')
                .setCta()
                .onClick(async () => {
                    const { presets: updatedPresets } = this.presetsSettingsService.addPreset(settings.presets);
                    await this.savePresetsSettings(updatedPresets, settings, refreshView);
                });
        });
    }

    /**
     * Updates settings with new presets and refreshes UI if needed
     * @param updatedPresets The new presets map
     * @param settings The current settings object to update
     * @param refreshView Callback to refresh the view (pass null if no refresh is needed)
     */
    private async savePresetsSettings(
        updatedPresets: PresetsMap,
        settings: Settings,
        refreshView: RefreshViewCallback | null,
    ) {
        // TODO Consider how this relates to the validation code - should it refuse to save settings if validation fails?
        // Update the settings in storage
        updateSettings({ presets: updatedPresets });
        await this.plugin.saveSettings();

        // Update the local settings object to reflect the changes
        settings.presets = { ...updatedPresets };

        // Refresh the view if a callback was provided
        if (refreshView) {
            refreshView();
        }

        this.events.triggerReloadOpenSearchResults();
    }
}
