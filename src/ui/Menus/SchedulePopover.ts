import { ButtonComponent } from 'obsidian';
import { TASK_FORMATS } from '../../Config/Settings';
import type { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';
import { RemoveReminderTime } from '../EditInstructions/ReminderInstructions';
import { RemoveScheduledDateAndReminder, SetSchedule } from '../EditInstructions/ScheduleInstructions';
import ScheduleEditor from '../ScheduleEditor.svelte';
import type { TaskSaver } from './TaskEditingMenu';
import { defaultTaskSaver } from './TaskEditingMenu';

/** Where a {@link SchedulePopover} appears: next to an existing element (its own bounding rect), or at a
 *  fixed point (e.g. the mouse position from the context-menu click that opened it, when there's no single
 *  persistent element to anchor to - see {@link DateMenu}'s "Add a reminder…" item). */
export type PopoverAnchor = HTMLElement | { x: number; y: number };

/**
 * The standalone popup counterpart to the edit modal's embedded "Schedule" section - same text input, date
 * picker, time picker and two remove buttons ({@link ScheduleEditor}), positioned next to whatever element
 * or point opened it, like the Scheduled Date pill's own flatpickr popover ({@link promptForDate}) - rather
 * than Obsidian's `Modal` (centred on the page, dimmed background, focus-trapped), which is far more
 * "present" than a single field warrants. Replaces the former `ScheduleDialog`.
 *
 * Closed by Escape, the Cancel/Apply buttons, or a click outside the popover - a click outside applies
 * whatever is currently pending (if valid), the same auto-apply-on-close behaviour {@link promptForDate}'s
 * flatpickr calendar already has, so dismissing it isn't itself a silent way to lose an edit. Escape/Cancel
 * discard instead, matching `Modal`'s own previous behaviour.
 *
 * Opened from: left-clicking an existing Reminder Time pill ({@link TaskLineRenderer}), the Scheduled Date
 * picker's "Add a reminder…" button ({@link promptForDate}), the Scheduled Date right-click menu's "Add a
 * reminder…" item ({@link DateMenu}), and the Reminder Notifications view's own reminder pill.
 */
export class SchedulePopover {
    private readonly containerEl: HTMLDivElement;
    private component: ScheduleEditor | undefined;
    private scheduledDate: string;
    private reminderTime: string;
    private isValid = true;
    private closed = false;

    constructor(
        anchor: PopoverAnchor,
        private readonly task: Task,
        private readonly taskSaver: TaskSaver = defaultTaskSaver,
    ) {
        this.scheduledDate = task.scheduledDate?.format('YYYY-MM-DD') ?? '';
        this.reminderTime = task.reminderTime ?? '';

        this.containerEl = activeDocument.body.createDiv({ cls: 'tasks-schedule-popover' });
        this.position(anchor);
        this.render();
        this.clampToViewport();

        const input = this.containerEl.querySelector<HTMLInputElement>('#schedule');
        input?.focus();

        // Deferred so the very click that opened this popover (still bubbling up to `document`) doesn't
        // immediately close it again.
        window.setTimeout(() => {
            activeDocument.addEventListener('mousedown', this.onOutsideMouseDown, true);
            window.addEventListener('scroll', this.onCancel, true);
            window.addEventListener('resize', this.onCancel);
        }, 0);
    }

    private position(anchor: PopoverAnchor): void {
        const el = this.containerEl;
        if (anchor instanceof HTMLElement) {
            const rect = anchor.getBoundingClientRect();
            el.style.top = `${rect.bottom + 4}px`;
            el.style.left = `${rect.left}px`;
        } else {
            el.style.top = `${anchor.y + 4}px`;
            el.style.left = `${anchor.x}px`;
        }
    }

    /** Nudges the popover back on-screen once its real size is known (only possible after render()) - flips
     *  above the anchor if there's no room below, and pulls it left if it would overhang the right edge. */
    private clampToViewport(): void {
        const rect = this.containerEl.getBoundingClientRect();
        const overflowRight = rect.right - window.innerWidth;
        if (overflowRight > 0) {
            this.containerEl.style.left = `${Math.max(4, rect.left - overflowRight - 4)}px`;
        }
        const overflowBottom = rect.bottom - window.innerHeight;
        if (overflowBottom > 0) {
            this.containerEl.style.top = `${Math.max(4, rect.top - rect.height - 8)}px`;
        }
    }

    private render(): void {
        const { scheduledDateSymbol, reminderTimeSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

        // Same section class EditTask.svelte uses, so this popup's pickers/inputs pick up the exact same
        // styling and grid layout (see ScheduleEditor.scss/EditTask.scss) as the embedded modal usage.
        const section = this.containerEl.createDiv({ cls: 'tasks-modal-dates-section' });

        this.component = new ScheduleEditor({
            target: section,
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

        const buttonRow = this.containerEl.createDiv({ cls: 'tasks-schedule-popover-buttons' });
        new ButtonComponent(buttonRow).setButtonText('Cancel').onClick(this.onCancel);
        new ButtonComponent(buttonRow)
            .setButtonText('Apply')
            .setCta()
            .onClick(() => void this.apply());

        this.containerEl.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                void this.apply();
            } else if (ev.key === 'Escape') {
                ev.preventDefault();
                this.onCancel();
            }
        });
    }

    private onOutsideMouseDown = (ev: MouseEvent): void => {
        if (!this.containerEl.contains(ev.target as Node)) {
            void this.apply();
        }
    };

    private onCancel = (): void => {
        this.close();
    };

    private async apply(): Promise<void> {
        if (!this.isValid) {
            this.close();
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

    private close(): void {
        if (this.closed) {
            return;
        }
        this.closed = true;
        activeDocument.removeEventListener('mousedown', this.onOutsideMouseDown, true);
        window.removeEventListener('scroll', this.onCancel, true);
        window.removeEventListener('resize', this.onCancel);
        this.component?.$destroy();
        this.component = undefined;
        this.containerEl.remove();
    }
}
