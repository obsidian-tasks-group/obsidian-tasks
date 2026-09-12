import { type App, ButtonComponent, Modal, Setting } from 'obsidian';
import type { Task } from '../../Task/Task';
import { parseReminderTimeInput } from '../../DateTime/ReminderTimeParser';
import { SetReminderDateTime } from '../EditInstructions/ReminderInstructions';
import type { TaskSaver } from './TaskEditingMenu';

/**
 * The "Custom time…" escape hatch from {@link ReminderMenu}: a single text field accepting anything
 * {@link parseReminderTimeInput} understands (a clock time or a relative offset), for a value not covered
 * by the configured presets/relative offsets. Input here is never rounded - a typed value is already a
 * deliberate, exact choice.
 *
 * A plain `Modal` with one `Setting`, rather than a calendar/time-picker widget: every other affordance
 * used for editing a task (this plugin's own modal fields, the right-click `Menu`) is a native
 * Obsidian/browser primitive that inherits the app's theme for free; this keeps that consistent, rather
 * than pulling in another styled-from-scratch widget for one rarely-used entry point.
 */
export class ReminderPromptModal extends Modal {
    private value = '';
    private errorEl!: HTMLElement;

    constructor(app: App, private readonly task: Task, private readonly taskSaver: TaskSaver) {
        super(app);
        this.setTitle('Set reminder');
    }

    onOpen(): void {
        const { contentEl } = this;

        let inputEl: HTMLInputElement;
        new Setting(contentEl)
            .setName('Time')
            .setDesc("A clock time ('09:00', '9am') or a relative offset ('in 30 minutes', 'in 2 hours').")
            .addText((text) => {
                inputEl = text.inputEl;
                text.setPlaceholder("Try '09:00' or 'in 30 minutes'").onChange((value) => {
                    this.value = value;
                });
            });

        this.errorEl = contentEl.createEl('p', { cls: 'tasks-modal-error' });

        const buttonContainerEl = contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl).setButtonText('Cancel').onClick(() => this.close());
        new ButtonComponent(buttonContainerEl)
            .setButtonText('Apply')
            .setCta()
            .onClick(() => this.apply());

        this.scope.register([], 'Enter', () => this.apply());

        window.setTimeout(() => inputEl.focus());
    }

    private async apply(): Promise<void> {
        const parsed = parseReminderTimeInput(this.value, window.moment());
        if (parsed === null) {
            this.errorEl.setText(`Could not understand '${this.value}' as a time.`);
            return;
        }

        const newTask = new SetReminderDateTime(parsed.date).apply(this.task);
        await this.taskSaver(this.task, newTask);
        this.close();
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
