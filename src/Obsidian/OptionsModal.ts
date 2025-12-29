import type { App } from 'obsidian';
import { Modal } from 'obsidian';

export interface OptionsModalParams {
    app: App;
    onSave: (options: { option1: boolean; option2: boolean; option3: boolean }) => void;
}

export class OptionsModal extends Modal {
    private readonly onSave: (options: { option1: boolean; option2: boolean; option3: boolean }) => void;
    private option1 = false;
    private option2 = false;
    private option3 = false;

    constructor({ app, onSave }: OptionsModalParams) {
        super(app);
        this.onSave = onSave;
    }

    public onOpen(): void {
        this.titleEl.setText('Options');
        this.modalEl.style.paddingBottom = '0';

        const { contentEl } = this;
        contentEl.style.paddingBottom = '0';

        contentEl.createEl('div', { cls: 'checkbox-group' }, (div) => {
            // Option 1
            const option1Container = div.createEl('div', { cls: 'checkbox-item' });
            const option1Input = option1Container.createEl('input', { type: 'checkbox' });
            option1Input.addEventListener('change', (e) => {
                this.option1 = (e.target as HTMLInputElement).checked;
            });
            option1Container.createEl('span', { text: 'Option 1' });

            // Option 2
            const option2Container = div.createEl('div', { cls: 'checkbox-item' });
            const option2Input = option2Container.createEl('input', { type: 'checkbox' });
            option2Input.addEventListener('change', (e) => {
                this.option2 = (e.target as HTMLInputElement).checked;
            });
            option2Container.createEl('span', { text: 'Option 2' });

            // Option 3
            const option3Container = div.createEl('div', { cls: 'checkbox-item' });
            const option3Input = option3Container.createEl('input', { type: 'checkbox' });
            option3Input.addEventListener('change', (e) => {
                this.option3 = (e.target as HTMLInputElement).checked;
            });
            option3Container.createEl('span', { text: 'Option 3' });
        });

        // Footer buttons
        const footerEl = contentEl.createEl('div', { cls: 'modal-footer' });
        const saveButton = footerEl.createEl('button', {
            text: 'Apply',
            cls: 'mod-cta',
        });
        saveButton.addEventListener('click', () => {
            this.onSave({ option1: this.option1, option2: this.option2, option3: this.option3 });
            this.close();
        });

        const cancelButton = footerEl.createEl('button', { text: 'Cancel' });
        cancelButton.addEventListener('click', () => {
            this.close();
        });

        // Add styles
        this.addStyles();
    }

    public onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }

    private addStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 20px;
            }

            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            .checkbox-item:hover {
                background-color: var(--background-modifier-hover);
            }

            .checkbox-item input[type="checkbox"] {
                margin: 0;
            }

            .checkbox-item span {
                user-select: none;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                padding: 16px 20px;
                border-top: 1px solid var(--background-modifier-border);
            }

            .modal-footer button {
                padding: 6px 12px;
                border-radius: 4px;
                border: 1px solid var(--background-modifier-border);
                background: var(--interactive-normal);
                color: var(--text-normal);
                cursor: pointer;
            }

            .modal-footer button:hover {
                background: var(--interactive-hover);
            }

            .modal-footer button.mod-cta {
                background: var(--interactive-accent);
                color: var(--text-on-accent);
                border-color: var(--interactive-accent);
            }

            .modal-footer button.mod-cta:hover {
                background: var(--interactive-accent-hover);
            }
        `;
        document.head.appendChild(style);
    }
}
