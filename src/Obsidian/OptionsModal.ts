import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import { flushSync, mount, unmount } from 'svelte';
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
    private component?: Record<string, any>;

    constructor({ app, onSave }: OptionsModalParams) {
        super(app);
        this.onSave = onSave;
    }

    public onOpen(): void {
        this.titleEl.setText('Hide unused fields');

        this.modalEl.addClass('tasks-options-modal-container');

        const { contentEl } = this;
        this.contentEl.style.paddingBottom = '0';

        this.component = mount(ModalOptionsEditor, {
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
        flushSync();
    }

    public onClose(): void {
        const { contentEl } = this;
        if (this.component) {
            const component = this.component;
            this.component = undefined;
            void unmount(component).then(() => contentEl.empty());
            return;
        }

        contentEl.empty();
    }
}
