import { type App, Modal, Notice, Setting } from 'obsidian';

export interface QuickSearchOptionsModalParams {
    app: App;
    fuzzyMatching: boolean;
    onChange: (fuzzyMatching: boolean) => Promise<void>;
}

/** Allows users to change Quick Search behaviour without leaving the search modal. */
export class QuickSearchOptionsModal extends Modal {
    private fuzzyMatching: boolean;
    private readonly onChange: (fuzzyMatching: boolean) => Promise<void>;

    constructor({ app, fuzzyMatching, onChange }: QuickSearchOptionsModalParams) {
        super(app);
        this.fuzzyMatching = fuzzyMatching;
        this.onChange = onChange;
    }

    public onOpen(): void {
        this.titleEl.setText('Quick search');
        this.modalEl.addClass('tasks-quick-search-options-modal');

        new Setting(this.contentEl)
            .setName('Fuzzy search')
            .setDesc('Allow non-contiguous characters to match task descriptions and rank the closest matches first.')
            .addToggle((toggle) => {
                toggle.setValue(this.fuzzyMatching).onChange(async (value) => {
                    const previousValue = this.fuzzyMatching;
                    this.fuzzyMatching = value;
                    toggle.setDisabled(true);
                    try {
                        await this.onChange(value);
                    } catch (error) {
                        this.fuzzyMatching = previousValue;
                        toggle.setValue(previousValue);
                        console.error('Tasks: Could not save Quick Search options.', error);
                        new Notice('Tasks: Could not save Quick Search options.');
                    } finally {
                        toggle.setDisabled(false);
                    }
                });
            });
    }

    public onClose(): void {
        this.contentEl.empty();
    }
}
