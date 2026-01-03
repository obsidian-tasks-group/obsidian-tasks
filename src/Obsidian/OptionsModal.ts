import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import ModalOptionsEditor from '../ui/ModalOptionsEditor.svelte';

/**
 * Constructor parameter for {@link OptionsModal}.
 */
export interface OptionsModalParams {
    app: App;
    onSave: () => void;
}

/**
 * This is a modal that is shown within a {@link TaskModal} object to allow fields to be hidden.
 *
 * Implemented using {@link ModalOptionsEditor} Svelte component.
 */
export class OptionsModal extends Modal {
    private readonly onSave: () => void;

    constructor({ app, onSave }: OptionsModalParams) {
        super(app);
        this.onSave = onSave;
    }

    public onOpen(): void {
        this.titleEl.setText('Hide unused fields');
        this.titleEl.style.marginRight = '24px';

        this.modalEl.style.paddingBottom = '0';
        this.modalEl.style.width = 'fit-content';

        const { contentEl } = this;
        this.contentEl.style.paddingBottom = '0';

        new ModalOptionsEditor({
            target: contentEl,
            props: {
                onSave: () => {
                    this.onSave();
                    this.close();
                },
                onClose: () => {
                    this.onClose();
                    this.close();
                },
            },
        });
    }

    public onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
