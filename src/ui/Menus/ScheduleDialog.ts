import { type App, ButtonComponent, Modal } from 'obsidian';
import { TASK_FORMATS } from '../../Config/Settings';
import type { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';
import { RemoveReminderTime } from '../EditInstructions/ReminderInstructions';
import { RemoveScheduledDateAndReminder, SetSchedule } from '../EditInstructions/ScheduleInstructions';
import ScheduleEditor from '../ScheduleEditor.svelte';
import type { TaskSaver } from './TaskEditingMenu';
import { defaultTaskSaver } from './TaskEditingMenu';

/**
 * The standalone popup counterpart to the edit modal's embedded "Schedule" section - same text input, date
 * picker, time picker and two remove buttons ({@link ScheduleEditor}), wrapped in its own `Modal` with
 * explicit Apply/Cancel buttons (rather than autosave-on-change: text can be transiently invalid mid-typing,
 * and two live pickers sit alongside it, so a stray keystroke or drag should never silently commit to disk).
 *
 * Opened from: left-clicking an existing Reminder Time pill ({@link TaskLineRenderer}), the Scheduled Date
 * picker's "Add a reminder…" button ({@link promptForDate}), and the Scheduled Date right-click menu's "Add
 * a reminder…" item ({@link DateMenu}). Replaces {@link ReminderPromptModal}'s former "Custom time…" role.
 */
export class ScheduleDialog extends Modal {
    private component: ScheduleEditor | undefined;
    private scheduledDate: string;
    private reminderTime: string;
    private isValid = true;

    constructor(app: App, private readonly task: Task, private readonly taskSaver: TaskSaver = defaultTaskSaver) {
        super(app);
        this.setTitle('Schedule');
        this.scheduledDate = task.scheduledDate?.format('YYYY-MM-DD') ?? '';
        this.reminderTime = task.reminderTime ?? '';
    }

    onOpen(): void {
        const { scheduledDateSymbol, reminderTimeSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

        // Wrap in the same section class EditTask.svelte uses, so this popup's pickers/inputs pick up the
        // exact same styling (see ScheduleEditor.scss) as the embedded modal usage, with no duplicated CSS.
        const container = this.contentEl.createDiv({ cls: 'tasks-modal-dates-section' });

        this.component = new ScheduleEditor({
            target: container,
            props: {
                scheduledDate: this.scheduledDate,
                reminderTime: this.reminderTime,
                scheduledDateSymbol,
                reminderTimeSymbol,
                accesskey: null,
                originalScheduledDate: this.task.scheduledDate,
                onRemoveScheduledDate: () => this.applyAndClose(new RemoveScheduledDateAndReminder(this.task)),
                onRemoveReminderTime: () => this.applyAndClose(new RemoveReminderTime()),
                onScheduledDateChange: (value: string) => {
                    this.scheduledDate = value;
                },
                onReminderTimeChange: (value: string) => {
                    this.reminderTime = value;
                },
                onValidityChange: (value: boolean) => {
                    this.isValid = value;
                },
            },
        });

        const buttonContainerEl = this.contentEl.createDiv({ cls: 'modal-button-container' });
        new ButtonComponent(buttonContainerEl).setButtonText('Cancel').onClick(() => this.close());
        new ButtonComponent(buttonContainerEl)
            .setButtonText('Apply')
            .setCta()
            .onClick(() => this.apply());

        this.scope.register([], 'Enter', () => this.apply());
    }

    private async apply(): Promise<void> {
        if (!this.isValid) {
            return;
        }
        const scheduledDate = this.scheduledDate ? window.moment(this.scheduledDate) : null;
        const reminderTime = this.reminderTime || null;
        await this.applyAndClose(new SetSchedule(scheduledDate, reminderTime));
    }

    private async applyAndClose(instruction: TaskEditingInstruction): Promise<void> {
        const newTasks = instruction.apply(this.task);
        await this.taskSaver(this.task, newTasks);
        this.close();
    }

    onClose(): void {
        this.component?.$destroy();
        this.component = undefined;
        this.contentEl.empty();
    }
}
