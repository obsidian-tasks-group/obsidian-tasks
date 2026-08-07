import {
    type App,
    ButtonComponent,
    Modal,
    Setting,
    type SettingDefinition,
    type SettingDefinitionItem,
    TextAreaComponent,
    TextComponent,
    displayTooltip,
} from 'obsidian';
import type TasksPlugin from '../main';
import type { TasksEvents } from '../Obsidian/TasksEvents';
import { PresetsSettingsService, type RenamesInProgress } from '../Query/Presets/PresetsSettingsService';
import type { PresetsMap } from '../Query/Presets/Presets';
import { i18n } from '../i18n/i18n';
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
     * Returns declarative setting definitions for the Presets sub-page.
     * Used by the Obsidian 1.13.0+ getSettingDefinitions() path; older
     * versions render via {@link renderPresetsSettings} instead.
     *
     * @param refresh Callback the host invokes to rebuild the page after a
     *                structural change (add/rename/delete).
     */
    public getPresetsDefinitions(refresh: () => void): SettingDefinitionItem[] {
        const presets = getSettings().presets;

        return [
            {
                type: 'list',
                emptyState: i18n.t('settings.presets.emptyState'),
                addItem: {
                    name: i18n.t('settings.presets.buttons.addNewPreset'),
                    action: () => this.openEditPresetForm(null, refresh),
                },
                onReorder: (oldIndex, newIndex) => {
                    const currentKeys = Object.keys(getSettings().presets);
                    const key = currentKeys[oldIndex];
                    if (!key) {
                        return;
                    }
                    const updated = this.presetsSettingsService.reorderPreset(getSettings().presets, key, newIndex);
                    if (updated) {
                        // The list has already moved the row, so no refresh is needed.
                        this.savePresetsSettings(updated, getSettings(), null);
                    }
                },
                onDelete: (index) => {
                    const currentKeys = Object.keys(getSettings().presets);
                    const key = currentKeys[index];
                    if (!key) {
                        return;
                    }
                    const updated = this.presetsSettingsService.deletePreset(getSettings().presets, key);
                    this.savePresetsSettings(updated, getSettings(), refresh);
                },
                items: Object.keys(presets).map((key) => this.presetRow(key, presets[key] ?? '', refresh)),
            },
        ];
    }

    private presetRow(key: string, value: string, refresh: () => void): SettingDefinition {
        return {
            name: key,
            desc: value,
            render: (setting) => {
                setting.descEl.addClass('tasks-presets-value-preview');
                setting.addExtraButton((btn) =>
                    btn
                        .setIcon('lucide-pencil')
                        .setTooltip(i18n.t('common.edit'))
                        .onClick(() => this.openEditPresetForm(key, refresh)),
                );
            },
        };
    }

    /**
     * Open the modal that creates a preset (`key === null`) or edits the
     * preset named `key`, persisting the result when the user saves.
     */
    private openEditPresetForm(key: string | null, refresh: () => void): void {
        const presets = getSettings().presets;
        const initial = key === null ? { name: '', value: '' } : { name: key, value: presets[key] ?? '' };
        new EditPresetModal(this.plugin.app, presets, key, initial, (name, value) => {
            let next = getSettings().presets;
            if (key !== null && key !== name) {
                const renamed = this.presetsSettingsService.renamePreset(next, key, name);
                if (!renamed) {
                    return;
                }
                next = renamed;
            }
            next = this.presetsSettingsService.updatePresetValue(next, name, value);
            this.savePresetsSettings(next, getSettings(), refresh);
        }).open();
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
            const commitRename = () => {
                if (newKey && newKey !== key) {
                    const updatedPresets = this.presetsSettingsService.renamePreset(settings.presets, key, newKey);
                    if (updatedPresets) {
                        this.savePresetsSettings(updatedPresets, settings, refreshView);
                    }
                }
            };

            text.inputEl.addEventListener('blur', commitRename);
            text.inputEl.addEventListener('keydown', (e) => {
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
                this.savePresetsSettings(updatedPresets, settings, null);
            });
        });

        // Add drag handle
        setting.addExtraButton((btn) => {
            btn.extraSettingsEl.addClass('tasks-presets-drag-handle');
            btn.setIcon('grip-vertical').setTooltip('Drag to reorder');

            btn.extraSettingsEl.addEventListener('mousedown', (_e) => {
                // Enable dragging only when mousedown starts on the handle
                wrapper.draggable = true;
                btn.extraSettingsEl.addClass('tasks-presets-drag-handle-active');
            });
            btn.extraSettingsEl.addEventListener('mouseup', (_e) => {
                btn.extraSettingsEl.removeClass('tasks-presets-drag-handle-active');
            });
        });

        // Add delete button
        setting.addExtraButton((btn) => {
            btn.extraSettingsEl.addClass('tasks-presets-delete-button');
            btn.setIcon('cross')
                .setTooltip('Delete')
                .onClick(async () => {
                    const updatedPresets = this.presetsSettingsService.deletePreset(settings.presets, key);
                    this.savePresetsSettings(updatedPresets, settings, refreshView);
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
        wrapper.addEventListener('drop', (e) => {
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
                this.savePresetsSettings(updatedPresets, settings, refreshView);
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
            // Reset height first.
            // We have to use setCssProps to stop Obsidian eslint from complaining
            // about the more simple assignment of a fixed 'auto' height.
            textArea.inputEl.setCssProps({
                height: 'auto',
            });

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
            btn.setButtonText(i18n.t('settings.presets.buttons.addNewPreset'))
                .setCta()
                .onClick(async () => {
                    const { presets: updatedPresets } = this.presetsSettingsService.addPreset(settings.presets);
                    this.savePresetsSettings(updatedPresets, settings, refreshView);
                });
        });
    }

    /**
     * Updates settings with new presets and refreshes UI if needed
     * @param updatedPresets The new presets map
     * @param settings The current settings object to update
     * @param refreshView Callback to refresh the view (pass null if no refresh is needed)
     */
    private savePresetsSettings(
        updatedPresets: PresetsMap,
        settings: Settings,
        refreshView: RefreshViewCallback | null,
    ) {
        // TODO Consider how this relates to the validation code - should it refuse to save settings if validation fails?
        // Update the settings in storage
        updateSettings({ presets: updatedPresets });
        void this.plugin.saveSettings();

        // Update the local settings object to reflect the changes
        settings.presets = { ...updatedPresets };

        // Refresh the view if a callback was provided
        if (refreshView) {
            refreshView();
        }

        this.events.triggerReloadOpenSearchResults();
    }
}

/**
 * Modal for creating or editing a preset. Collects a name and a query in a form
 * and persists via the callback when the user clicks Save.
 *
 * Pass `editingKey === null` to create a new preset; pass a key to edit that
 * preset (renames are allowed as long as the new name isn't a duplicate).
 */
class EditPresetModal extends Modal {
    private readonly nameInput: TextComponent;
    private readonly valueInput: TextAreaComponent;

    constructor(
        app: App,
        private readonly existing: Readonly<PresetsMap>,
        private readonly editingKey: string | null,
        initial: { name: string; value: string },
        private readonly onSave: (name: string, value: string) => void,
    ) {
        super(app);
        this.modalEl.addClass('mod-lg');
        this.setTitle(
            editingKey === null
                ? i18n.t('settings.presets.buttons.addNewPreset')
                : i18n.t('modals.editPresetModal.title'),
        );

        let nameRef!: TextComponent;
        let valueRef!: TextAreaComponent;

        new Setting(this.contentEl).setName(i18n.t('modals.editPresetModal.name.name')).addText((text) => {
            text.setPlaceholder(i18n.t('modals.editPresetModal.name.placeholder')).setValue(initial.name);
            nameRef = text;
        });

        new Setting(this.contentEl)
            .setName(i18n.t('modals.editPresetModal.query.name'))
            .setDesc(i18n.t('modals.editPresetModal.query.description'))
            .addTextArea((text) => {
                text.setPlaceholder(i18n.t('modals.editPresetModal.query.placeholder')).setValue(initial.value);
                text.inputEl.rows = 6;
                valueRef = text;
            });

        this.nameInput = nameRef;
        this.valueInput = valueRef;

        this.nameInput.inputEl.addEventListener('keydown', (evt) => {
            if (!evt.isComposing && evt.key === 'Enter') {
                evt.preventDefault();
                this.submit();
            }
        });

        const buttonContainerEl = this.contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl)
            .setButtonText(i18n.t('common.save'))
            .setCta()
            .onClick(() => this.submit());
        new ButtonComponent(buttonContainerEl).setButtonText(i18n.t('common.cancel')).onClick(() => this.close());
    }

    onOpen(): void {
        this.nameInput.inputEl.focus();
        this.nameInput.inputEl.select();
    }

    private submit(): void {
        const name = this.nameInput.getValue().trim();
        if (!name) {
            displayTooltip(this.nameInput.inputEl, i18n.t('modals.editPresetModal.name.required'), {
                classes: ['mod-error'],
            });
            return;
        }
        const isRenamingToExisting =
            name !== this.editingKey && Object.prototype.hasOwnProperty.call(this.existing, name);
        if (isRenamingToExisting) {
            displayTooltip(this.nameInput.inputEl, i18n.t('modals.editPresetModal.name.duplicate'), {
                classes: ['mod-error'],
            });
            return;
        }
        this.onSave(name, this.valueInput.getValue());
        this.close();
    }
}
