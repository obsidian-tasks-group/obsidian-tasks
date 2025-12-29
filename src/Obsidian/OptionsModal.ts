import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import ModalOptionsEditor from '../ui/ModalOptionsEditor.svelte';

export interface OptionsModalParams {
    app: App;
    onSave: () => void;
}

export class OptionsModal extends Modal {
    private readonly onSave: () => void;

    constructor({ app, onSave }: OptionsModalParams) {
        super(app);
        this.onSave = onSave;
    }

    public onOpen(): void {
        this.titleEl.setText('Options');
        this.modalEl.style.paddingBottom = '0';

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
