import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import { mount, unmount } from 'svelte';
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
    private _modalOptionsEditorComponent: ReturnType<typeof mount> | undefined;

    constructor({ app, onSave }: OptionsModalParams) {
        super(app);
        this.onSave = onSave;
    }

    public onOpen(): void {
        this.titleEl.setText('Hide unused fields');

        this.modalEl.addClass('tasks-options-modal-container');

        const { contentEl } = this;

        this._modalOptionsEditorComponent = mount(ModalOptionsEditor, {
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
        if (this._modalOptionsEditorComponent) {
            void unmount(this._modalOptionsEditorComponent);
            this._modalOptionsEditorComponent = undefined;
        }
        const { contentEl } = this;
        contentEl.empty();
    }
}
