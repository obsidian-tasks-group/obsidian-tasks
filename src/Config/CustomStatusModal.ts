import { Modal, Notice, Setting, TextComponent } from 'obsidian';
import type { Plugin } from 'obsidian';
import { StatusConfiguration, StatusType } from '../Statuses/StatusConfiguration';
import { StatusValidator } from '../Statuses/StatusValidator';
import { Status } from '../Statuses/Status';

const validator = new StatusValidator();

export class CustomStatusModal extends Modal {
    statusSymbol: string;
    statusName: string;
    statusNextSymbol: string;
    statusAvailableAsCommand: boolean;
    type: StatusType;

    saved: boolean = false;
    error: boolean = false;
    private isCoreStatus: boolean;
    constructor(public plugin: Plugin, statusType: StatusConfiguration, isCoreStatus: boolean) {
        super(plugin.app);
        this.statusSymbol = statusType.symbol;
        this.statusName = statusType.name;
        this.statusNextSymbol = statusType.nextStatusSymbol;
        this.statusAvailableAsCommand = statusType.availableAsCommand;
        this.type = statusType.type;
        this.isCoreStatus = isCoreStatus;
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
            this.type,
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
            .setDesc(
                'This is the character between the square braces. (It can only be edited for Custom statuses, and not Core statuses.)',
            )
            .addText((text) => {
                statusSymbolText = text;
                text.setValue(this.statusSymbol).onChange((v) => {
                    this.statusSymbol = v;
                    CustomStatusModal.setValid(text, validator.validateSymbol(this.statusConfiguration()));
                });
            })
            .setDisabled(this.isCoreStatus)
            .then((_setting) => {
                // Show any error if the initial value loaded is incorrect.
                CustomStatusModal.setValid(statusSymbolText, validator.validateSymbol(this.statusConfiguration()));
            });

        let statusNameText: TextComponent;
        new Setting(settingDiv)
            .setName('Task Status Name')
            .setDesc('This is the friendly name of the task status.')
            .addText((text) => {
                statusNameText = text;
                text.setValue(this.statusName).onChange((v) => {
                    this.statusName = v;
                    CustomStatusModal.setValid(text, validator.validateName(this.statusConfiguration()));
                });
            })
            .then((_setting) => {
                CustomStatusModal.setValid(statusNameText, validator.validateName(this.statusConfiguration()));
            });

        let statusNextSymbolText: TextComponent;
        new Setting(settingDiv)
            .setName('Task Next Status Symbol')
            .setDesc('When clicked on this is the symbol that should be used next.')
            .addText((text) => {
                statusNextSymbolText = text;
                text.setValue(this.statusNextSymbol).onChange((v) => {
                    this.statusNextSymbol = v;
                    CustomStatusModal.setValid(text, validator.validateNextSymbol(this.statusConfiguration()));
                });
            })
            .then((_setting) => {
                CustomStatusModal.setValid(
                    statusNextSymbolText,
                    validator.validateNextSymbol(this.statusConfiguration()),
                );
            });

        new Setting(settingDiv)
            .setName('Task Status Type')
            .setDesc('Control how the status behaves for searching and toggling.')
            .addDropdown((dropdown) => {
                const types = [
                    StatusType.TODO,
                    StatusType.IN_PROGRESS,
                    StatusType.DONE,
                    StatusType.CANCELLED,
                    StatusType.NON_TASK,
                ];
                types.forEach((s) => {
                    dropdown.addOption(s, s);
                });
                dropdown.setValue(this.type).onChange((v) => {
                    this.type = Status.getTypeFromStatusTypeString(v);
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
                    const errors = validator.validate(this.statusConfiguration());
                    if (errors.length > 0) {
                        const message = errors.join('\n') + '\n\n' + 'Fix errors before saving.';
                        // console.debug(message);
                        new Notice(message);
                        return;
                    }
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

    static setValidationError(textInput: TextComponent) {
        textInput.inputEl.addClass('tasks-settings-is-invalid');
    }

    static removeValidationError(textInput: TextComponent) {
        textInput.inputEl.removeClass('tasks-settings-is-invalid');
    }

    private static setValid(text: TextComponent, messages: string[]) {
        const valid = messages.length === 0;
        if (valid) {
            CustomStatusModal.removeValidationError(text);
        } else {
            CustomStatusModal.setValidationError(text);
        }
    }
}
