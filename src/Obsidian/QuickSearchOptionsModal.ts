import { type App, Modal, Setting } from 'obsidian';

export interface QuickSearchOptionsModalParams {
    app: App;
    fuzzyMatching: boolean;
    onChange: (fuzzyMatching: boolean) => Promise<void>;
}

/** Allows users to change Quick Search behaviour without leaving the search modal. */
export class QuickSearchOptionsModal extends Modal {
    private readonly fuzzyMatching: boolean;
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
                    await this.onChange(value);
                });
            });
    }

    public onClose(): void {
        this.contentEl.empty();
    }
}
