import { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction to set the task's {@link Task.reminderTime} to a fixed 'HH:mm' value.
 *
 * A reminder always anchors to {@link Task.scheduledDate}, and only that field - if the task has none, one
 * is created as today: a reminder time is meaningless without a day to attach it to (see
 * {@link Task.reminderDateTime}), and this fork's UX is built around "set a time, get a day for free" rather
 * than asking the user to separately pick both.
 *
 * See also {@link SetReminderDateTime}, {@link RemoveReminderTime}.
 */
export class SetReminderTime implements TaskEditingInstruction {
    private readonly newReminderTime: string;
    private readonly displayName: string;

    constructor(reminderTime: string, displayName?: string) {
        this.newReminderTime = reminderTime;
        this.displayName = displayName ?? `Set reminder: ${reminderTime}`;
    }

    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            return [task];
        }
        if (task.scheduledDate === null) {
            return [
                new Task({
                    ...task,
                    reminderTime: this.newReminderTime,
                    scheduledDate: window.moment().startOf('day'),
                }),
            ];
        }
        return [
            new Task({
                ...task,
                reminderTime: this.newReminderTime,
            }),
        ];
    }

    public instructionDisplayName(): string {
        return this.displayName;
    }

    public isCheckedForTask(task: Task): boolean {
        if (task.reminderTime !== this.newReminderTime) {
            return false;
        }
        // If there's no scheduled date yet, applying would still add one (see apply()), so this isn't a no-op.
        return task.scheduledDate !== null;
    }
}

/**
 * An instruction to set a task's reminder to a specific date and time, shifting the task's
 * {@link Task.scheduledDate} if {@link target} falls on a different calendar day than it, and leaving it
 * untouched otherwise. If the task has no scheduled date at all, one is created, dated to {@link target} -
 * rather than left with a reminder time and no day to attach it to (see {@link SetReminderTime}'s own doc
 * comment for why).
 *
 * Used for relative-offset picks ('in 30 minutes') in the right-click reminder menu, which carry a full date
 * and time, unlike {@link SetReminderTime}'s fixed clock time.
 *
 * See also {@link SetReminderTime}, {@link RemoveReminderTime}.
 */
export class SetReminderDateTime implements TaskEditingInstruction {
    private readonly target: Moment;
    private readonly displayName: string;

    constructor(target: Moment, displayName?: string) {
        this.target = target;
        this.displayName = displayName ?? `Set reminder: ${target.format('HH:mm')}`;
    }

    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            return [task];
        }

        const newReminderTime = this.target.format('HH:mm');
        if (task.scheduledDate === null) {
            return [
                new Task({
                    ...task,
                    reminderTime: newReminderTime,
                    scheduledDate: this.target.clone().startOf('day'),
                }),
            ];
        }

        const dayDelta = this.target.clone().startOf('day').diff(task.scheduledDate.clone().startOf('day'), 'days');
        const newScheduledDate = dayDelta === 0 ? task.scheduledDate : task.scheduledDate.clone().add(dayDelta, 'days');

        return [
            new Task({
                ...task,
                reminderTime: newReminderTime,
                scheduledDate: newScheduledDate,
            }),
        ];
    }

    public instructionDisplayName(): string {
        return this.displayName;
    }

    public isCheckedForTask(task: Task): boolean {
        if (task.reminderTime !== this.target.format('HH:mm')) {
            return false;
        }
        if (task.scheduledDate === null) {
            // No scheduled date yet - applying would still create one (see apply()), so this isn't a no-op.
            return false;
        }
        return task.scheduledDate.isSame(this.target, 'day');
    }
}

/**
 * An instruction to remove a task's reminder time, if it has one.
 *
 * See also {@link SetReminderTime}.
 */
export class RemoveReminderTime implements TaskEditingInstruction {
    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            return [task];
        }
        return [
            new Task({
                ...task,
                reminderTime: null,
            }),
        ];
    }

    public instructionDisplayName(): string {
        return 'Remove reminder';
    }

    public isCheckedForTask(task: Task): boolean {
        return task.reminderTime === null;
    }
}
