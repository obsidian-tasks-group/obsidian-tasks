import { Task } from '../../Task/Task';
import { removeDateMenuItemTitleForField } from '../../DateTime/Postponer';
import { RemoveTaskDate } from './DateInstructions';
import { RemoveReminderTime } from './ReminderInstructions';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction to set both {@link Task.scheduledDate} and {@link Task.reminderTime} at once, from an
 * already-resolved pair of values (see `ScheduleParser.resolveTypedSchedule`). Used only by the standalone
 * `SchedulePopover` - the main edit modal's own Apply flow keeps going through `EditableTask.applyEdits`
 * unchanged, since by the time Apply is clicked its two bound fields are already clean, resolved strings.
 *
 * See also {@link RemoveScheduledDateAndReminder}.
 */
export class SetSchedule implements TaskEditingInstruction {
    constructor(
        private readonly newScheduledDate: Moment | null,
        private readonly newReminderTime: string | null,
        private readonly displayName?: string,
    ) {}

    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            return [task];
        }
        return [
            new Task({
                ...task,
                scheduledDate: this.newScheduledDate,
                reminderTime: this.newReminderTime,
            }),
        ];
    }

    public instructionDisplayName(): string {
        return this.displayName ?? 'Set schedule';
    }

    public isCheckedForTask(task: Task): boolean {
        const sameDate =
            this.newScheduledDate === null
                ? task.scheduledDate === null
                : task.scheduledDate?.isSame(this.newScheduledDate, 'day') ?? false;
        return sameDate && task.reminderTime === this.newReminderTime;
    }
}

/**
 * An instruction to remove a task's scheduled date and, since a reminder can't exist without an anchor to
 * attach it to, its reminder time too - but only if the date removal actually happened. {@link RemoveTaskDate}
 * refuses to clear an inferred scheduled date (see its own doc comment), and in that case there's nothing to
 * cascade from, so the reminder is deliberately left alone rather than removed out from under an unrelated
 * refusal. Composes the two existing instructions rather than duplicating their guards.
 *
 * See also {@link SetSchedule}, {@link RemoveReminderTime}.
 */
export class RemoveScheduledDateAndReminder implements TaskEditingInstruction {
    private readonly displayName: string;

    constructor(task: Task, displayName?: string) {
        this.displayName = displayName ?? removeDateMenuItemTitleForField('scheduledDate', task);
    }

    public apply(task: Task): Task[] {
        const [afterDateRemoval] = new RemoveTaskDate('scheduledDate', task).apply(task);
        if (afterDateRemoval === task) {
            // No-op: already null, or an inferred date RemoveTaskDate refuses to touch.
            return [task];
        }
        return new RemoveReminderTime().apply(afterDateRemoval);
    }

    public instructionDisplayName(): string {
        return this.displayName;
    }

    public isCheckedForTask(task: Task): boolean {
        return task.scheduledDate === null && task.reminderTime === null;
    }
}
