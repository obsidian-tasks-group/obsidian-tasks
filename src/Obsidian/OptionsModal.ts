import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type { EditModalShowSettings } from '../Config/Settings';
import ModalOptionsEditor from '../ui/ModalOptionsEditor.svelte';

export interface OptionsModalParams {
    app: App;
    onSave: (options: EditModalShowSettings) => void;
}

export class OptionsModal extends Modal {
    private readonly onSave: (options: EditModalShowSettings) => void;

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
                onSave: (options: EditModalShowSettings) => {
                    this.onSave(options);
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
