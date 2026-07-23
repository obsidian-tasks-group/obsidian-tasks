import { type App, ButtonComponent, Modal, TextAreaComponent } from 'obsidian';
import { i18n } from '../i18n/i18n';

/**
 * Modal for editing the Global query in a full-width, multi-line textarea.
 * Uses `mod-lg` so the modal expands to full height on mobile. The longer
 * descriptive copy lives here (rather than inline on the settings row) so the
 * settings row itself can stay compact.
 */
export class GlobalQueryModal extends Modal {
    private readonly textarea: TextAreaComponent;

    constructor(app: App, initial: string, private readonly onSave: (value: string) => void) {
        super(app);
        this.modalEl.addClass('mod-lg');
        this.setTitle(i18n.t('settings.globalQuery.heading'));

        this.contentEl.createEl('p', {
            cls: 'setting-item-description',
            text: i18n.t('settings.globalQuery.query.description'),
        });
        const docsParaEl = this.contentEl.createEl('p', { cls: 'setting-item-description' });
        docsParaEl.createEl('a', {
            text: i18n.t('settings.seeTheDocumentation'),
            href: 'https://publish.obsidian.md/tasks/Queries/Global+Query',
        });
        docsParaEl.appendText('.');

        this.textarea = new TextAreaComponent(this.contentEl)
            .setPlaceholder('# ' + i18n.t('settings.globalQuery.query.placeholder'))
            .setValue(initial);
        this.textarea.inputEl.addClass('tasks-global-query-textarea');

        const buttonContainerEl = this.contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl)
            .setButtonText(i18n.t('common.save'))
            .setCta()
            .onClick(() => {
                this.onSave(this.textarea.getValue());
                this.close();
            });
        new ButtonComponent(buttonContainerEl).setButtonText(i18n.t('common.cancel')).onClick(() => this.close());
    }

    onOpen(): void {
        this.textarea.inputEl.focus();
    }
}
