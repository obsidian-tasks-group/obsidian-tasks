import {
    type App,
    ButtonComponent,
    Modal,
    type SettingDefinition,
    type SettingDefinitionItem,
    TextAreaComponent,
    TextComponent,
    displayTooltip,
} from 'obsidian';
import type TasksPlugin from '../main';
import type { TasksEvents } from '../Obsidian/TasksEvents';
import { PresetsSettingsService } from '../Query/Presets/PresetsSettingsService';
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
    private readonly rowSearchText = new WeakMap<SettingDefinition, string>();

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
     * Used by the Obsidian 1.13.0+ getSettingDefinitions() path.
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
                search: {
                    placeholder: i18n.t('settings.presets.filter.placeholder'),
                    match: (def, query) => {
                        const text = this.rowSearchText.get(def);
                        return text === undefined || text.includes(query.toLowerCase());
                    },
                },
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
                        // But we need to update the rowSearchText lookup to ensure that a later
                        // delete operation deletes the correct row.
                        this.savePresetsSettings(updated, getSettings(), refresh);
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
        const row: SettingDefinition = {
            name: key,
            desc: value,
            searchable: true,
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
        // Search both the name and the value.
        // The \n separator stops a query from matching across the end of the name and the start of the value.
        this.rowSearchText.set(row, `${key}\n${value}`.toLowerCase());
        return row;
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
        this.modalEl.addClass('mod-lg', 'tasks-edit-preset-modal');
        this.setTitle(
            editingKey === null
                ? i18n.t('settings.presets.buttons.addNewPreset')
                : i18n.t('modals.editPresetModal.title'),
        );

        // Form layout: each field is a label above a full-width control,
        // reusing Obsidian's own 'form-field' styling.
        const nameFieldEl = this.contentEl.createEl('p', { cls: 'form-field' });
        nameFieldEl.createEl('label', { text: i18n.t('modals.editPresetModal.name.name') });
        this.nameInput = new TextComponent(nameFieldEl)
            .setPlaceholder(i18n.t('modals.editPresetModal.name.placeholder'))
            .setValue(initial.name);

        const queryFieldEl = this.contentEl.createEl('p', { cls: 'form-field' });
        queryFieldEl.createEl('label', { text: i18n.t('modals.editPresetModal.query.name') });
        queryFieldEl.createDiv({ cls: 'form-field-help', text: i18n.t('modals.editPresetModal.query.description') });
        this.valueInput = new TextAreaComponent(queryFieldEl)
            .setPlaceholder(i18n.t('modals.editPresetModal.query.placeholder'))
            .setValue(initial.value);
        this.valueInput.inputEl.rows = 12;

        this.nameInput.inputEl.addEventListener('keydown', (evt) => {
            if (!evt.isComposing && evt.key === 'Enter') {
                evt.preventDefault();
                this.submit();
            }
        });

        const buttonContainerEl = this.contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl).setButtonText(i18n.t('common.cancel')).onClick(() => this.close());
        new ButtonComponent(buttonContainerEl)
            .setButtonText(i18n.t('common.save'))
            .setCta()
            .onClick(() => this.submit());
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
