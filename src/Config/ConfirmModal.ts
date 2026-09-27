import { type App, ButtonComponent, Modal, Setting } from 'obsidian';
import { i18n } from '../i18n/i18n';

export interface ConfirmModalOptions {
    title: string;
    paragraphs: string[];
    warning?: string;
    confirmText: string;
    /** If set, the user must tick a toggle with this label before they can confirm. */
    acknowledgement?: string;
    destructive?: boolean;
    /** Called once: true if confirmed, false if cancelled or closed. */
    onDecision: (confirmed: boolean) => void;
}

/**
 * A dialog asking the user to confirm an action.
 * Uses {@link Modal}, not ConfirmationModal, which is not available before Obsidian 1.13.
 */
export class ConfirmModal extends Modal {
    private decided = false;

    constructor(
        app: App,
        private readonly options: ConfirmModalOptions,
    ) {
        super(app);
        this.setTitle(options.title);

        for (const paragraph of options.paragraphs) {
            this.contentEl.createEl('p', { cls: 'setting-item-description', text: paragraph });
        }
        if (options.warning) {
            const warningEl = this.contentEl.createEl('p', { cls: 'setting-item-description mod-warning' });
            warningEl.createEl('b', { text: options.warning });
        }

        let acknowledged = options.acknowledgement === undefined;
        let confirmButton: ButtonComponent | null = null;
        if (options.acknowledgement !== undefined) {
            new Setting(this.contentEl).setName(options.acknowledgement).addToggle((toggle) =>
                toggle.setValue(false).onChange((value) => {
                    acknowledged = value;
                    confirmButton?.setDisabled(!acknowledged);
                }),
            );
        }

        const buttonContainerEl = this.contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl).setButtonText(i18n.t('common.cancel')).onClick(() => this.close());
        confirmButton = new ButtonComponent(buttonContainerEl)
            .setButtonText(options.confirmText)
            .setDisabled(!acknowledged)
            .onClick(() => {
                if (!acknowledged) {
                    return;
                }
                this.decide(true);
                this.close();
            });
        if (options.destructive) {
            confirmButton.setWarning();
        } else {
            confirmButton.setCta();
        }
    }

    onClose(): void {
        this.decide(false);
    }

    private decide(confirmed: boolean) {
        if (this.decided) {
            return;
        }
        this.decided = true;
        this.options.onDecision(confirmed);
    }
}
