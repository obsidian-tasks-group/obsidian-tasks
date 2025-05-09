import { Setting, TextAreaComponent } from 'obsidian';
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

    public setupAutoResizingTextarea(textArea: TextAreaComponent) {
        const resize = () => {
            textArea.inputEl.style.height = 'auto'; // reset first
            textArea.inputEl.style.height = `${textArea.inputEl.scrollHeight}px`;
        };

        // Initial resize
        resize();

        // Resize on input
        textArea.inputEl.addEventListener('input', resize);
    }

    createAddNewIncludeButton(containerEl: HTMLElement, settings: Settings, renderIncludes: RefreshViewCallback) {
        new Setting(containerEl).addButton((btn) => {
            btn.setButtonText('Add new include')
                .setCta()
                .onClick(async () => {
                    const { includes: updatedIncludes } = this.includesSettingsService.addInclude(settings.includes);
                    await this.saveIncludesSettings(updatedIncludes, settings, renderIncludes);
                });
        });
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

export function renderIncludeItem(
    includesSettingsUI: any,
    includesContainer: HTMLDivElement,
    settings: Settings,
    key: string,
    value: string,
    renderIncludes: RefreshViewCallback,
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
                const updatedIncludes = includesSettingsUI.includesSettingsService.renameInclude(
                    settings.includes,
                    key,
                    newKey,
                );
                if (updatedIncludes) {
                    await includesSettingsUI.saveIncludesSettings(updatedIncludes, settings, renderIncludes);
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

        includesSettingsUI.setupAutoResizingTextarea(textArea);

        return textArea.onChange(async (newValue) => {
            const updatedIncludes = includesSettingsUI.includesSettingsService.updateIncludeValue(
                settings.includes,
                key,
                newValue,
            );
            await includesSettingsUI.saveIncludesSettings(updatedIncludes, settings, null);
        });
    });

    // Add delete button
    setting.addExtraButton((btn) => {
        btn.setIcon('cross')
            .setTooltip('Delete')
            .onClick(async () => {
                const updatedIncludes = includesSettingsUI.includesSettingsService.deleteInclude(
                    settings.includes,
                    key,
                );
                await includesSettingsUI.saveIncludesSettings(updatedIncludes, settings, renderIncludes);
            });
    });
}
