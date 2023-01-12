import { Modal, Setting, TextComponent } from 'obsidian';
import { Status, StatusConfiguration } from '../Status';
import type TasksPlugin from '../main';

const isInvalidClass = 'is-invalid';
const hasInvalidMessage = 'has-invalid-message';

const unsetAlignItems = 'unset-align-items';
const dotUnsetAlignItems = '.' + unsetAlignItems;

const invalidFeedback = 'invalid-feedback';
const dotInvalidFeedback = '.' + 'invalid-feedback';

export class CustomStatusModal extends Modal {
    statusSymbol: string;
    statusName: string;
    statusNextSymbol: string;
    statusAvailableAsCommand: boolean;
    saved: boolean = false;
    error: boolean = false;
    constructor(public plugin: TasksPlugin, statusType: StatusConfiguration) {
        super(plugin.app);
        this.statusSymbol = statusType.indicator;
        this.statusName = statusType.name;
        this.statusNextSymbol = statusType.nextStatusIndicator;
        this.statusAvailableAsCommand = statusType.availableAsCommand;
    }

    /**
     * Return a {@link StatusConfiguration} from the modal's contents
     */
    public statusConfiguration() {
        return new StatusConfiguration(
            this.statusSymbol,
            this.statusName,
            this.statusNextSymbol,
            this.statusAvailableAsCommand,
        );
    }

    async display() {
        const { contentEl } = this;

        contentEl.empty();

        const settingDiv = contentEl.createDiv();
        //const title = this.title ?? '...';

        let statusSymbolText: TextComponent;
        new Setting(settingDiv)
            .setName('Task Status Symbol')
            .setDesc('This is the character between the square braces.')
            .addText((text) => {
                statusSymbolText = text;
                statusSymbolText.setValue(this.statusSymbol).onChange((v) => {
                    if (!v.length) {
                        CustomStatusModal.setValidationError(text, 'Task status type cannot be empty.');
                        return;
                    }

                    if (v.includes(' ')) {
                        CustomStatusModal.setValidationError(text, 'Task status type cannot include spaces.');
                        return;
                    }

                    if (v.length > 1) {
                        CustomStatusModal.setValidationError(text, 'Task status must be a single character.');
                        return;
                    }
                    CustomStatusModal.removeValidationError(text);
                    this.statusSymbol = v;
                });
            });

        new Setting(settingDiv)
            .setName('Task Status Name')
            .setDesc('This is the friendly name of the task status.')
            .addText((text) => {
                text.setValue(this.statusName).onChange((v) => {
                    this.statusName = v;
                });
            });

        new Setting(settingDiv)
            .setName('Task Next Status Symbol')
            .setDesc('When clicked on this is the symbol that should be used next.')
            .addText((text) => {
                text.setValue(this.statusNextSymbol).onChange((v) => {
                    this.statusNextSymbol = v;
                });
            });

        if (Status.tasksPluginCanCreateCommandsForStatuses()) {
            new Setting(settingDiv)
                .setName('Available as command')
                .setDesc(
                    'If enabled this status will be available as a command so you can assign a hotkey and toggle the status using it.',
                )
                .addToggle((toggle) => {
                    toggle.setValue(this.statusAvailableAsCommand).onChange(async (value) => {
                        this.statusAvailableAsCommand = value;
                    });
                });
        }

        const footerEl = contentEl.createDiv();
        const footerButtons = new Setting(footerEl);
        footerButtons.addButton((b) => {
            b.setTooltip('Save')
                .setIcon('checkmark')
                .onClick(async () => {
                    // let error = false;
                    // if (!this.statusSymbol.length) {
                    //     SettingsModal.setValidationError(this.statusSymbol, 'Task status type cannot be empty.');
                    //     error = true;
                    //     return;
                    // }

                    // if (error) {
                    //     new Notice('Fix errors before saving.');
                    //     return;
                    // }
                    this.saved = true;
                    this.close();
                });
            return b;
        });
        footerButtons.addExtraButton((b) => {
            b.setIcon('cross')
                .setTooltip('Cancel')
                .onClick(() => {
                    this.saved = false;
                    this.close();
                });
            return b;
        });
    }

    // updateTitle(admonitionPreview: HTMLElement, title: string) {
    //     let titleSpan = admonitionPreview.querySelector('.admonition-title-content');
    //     let iconEl = admonitionPreview.querySelector('.admonition-title-icon');
    //     titleSpan.textContent = title;
    //     titleSpan.prepend(iconEl);
    // }
    onOpen() {
        this.display();
    }

    static setValidationError(textInput: TextComponent, message?: string) {
        textInput.inputEl.addClass(isInvalidClass);
        if (message) {
            textInput.inputEl.parentElement?.addClasses([hasInvalidMessage, unsetAlignItems]);
            textInput.inputEl.parentElement?.parentElement?.addClass(dotUnsetAlignItems);
            let mDiv = textInput.inputEl.parentElement?.querySelector(dotInvalidFeedback) as HTMLDivElement;

            if (!mDiv) {
                mDiv = createDiv({ cls: invalidFeedback });
            }
            mDiv.innerText = message;
            mDiv.insertAfter(textInput.inputEl);
        }
    }
    static removeValidationError(textInput: TextComponent) {
        textInput.inputEl.removeClass(isInvalidClass);
        textInput.inputEl.parentElement?.removeClasses([hasInvalidMessage, unsetAlignItems]);
        textInput.inputEl.parentElement?.parentElement?.removeClass(dotUnsetAlignItems);

        const invalidFeedback = textInput.inputEl.parentElement?.querySelector(dotInvalidFeedback);
        if (invalidFeedback) {
            textInput.inputEl.parentElement?.removeChild(invalidFeedback);
        }
    }
}
