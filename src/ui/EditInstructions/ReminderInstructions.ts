import { Task } from '../../Task/Task';
import { getDateFieldToPostpone } from '../../DateTime/Postponer';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction to set the task's {@link Task.reminderTime} to a fixed 'HH:mm' value.
 *
 * If the task has no anchor date at all (due, scheduled or start - see {@link getDateFieldToPostpone}), one
 * is created as today's {@link Task.scheduledDate}: a reminder time is meaningless without a day to attach
 * it to (see {@link Task.reminderDateTime}), and this fork's UX is built around "set a time, get a day for
 * free" rather than asking the user to separately pick both.
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
        if (getDateFieldToPostpone(task) === null) {
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
        // If there's no anchor date yet, applying would still add one (see apply()), so this isn't a no-op.
        return getDateFieldToPostpone(task) !== null;
    }
}

/**
 * An instruction to set a task's reminder to a specific date and time, shifting the task's anchor date
 * (due, else scheduled, else start - the same priority {@link getDateFieldToPostpone} already uses) if
 * {@link target} falls on a different calendar day than it, and leaving the anchor untouched otherwise. If
 * the task has no anchor date at all, one is created - as {@link Task.scheduledDate}, dated to
 * {@link target} - rather than left with a reminder time and no day to attach it to (see
 * {@link SetReminderTime}'s own doc comment for why).
 *
 * Used for relative-offset picks ('in 30 minutes') and the "Custom time…" prompt, which carry a full date
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
        const anchorField = getDateFieldToPostpone(task);
        if (anchorField === null) {
            return [
                new Task({
                    ...task,
                    reminderTime: newReminderTime,
                    scheduledDate: this.target.clone().startOf('day'),
                }),
            ];
        }

        const anchorDate = task[anchorField]!;
        const dayDelta = this.target.clone().startOf('day').diff(anchorDate.clone().startOf('day'), 'days');
        const newAnchorDate = dayDelta === 0 ? anchorDate : anchorDate.clone().add(dayDelta, 'days');

        return [
            new Task({
                ...task,
                reminderTime: newReminderTime,
                [anchorField]: newAnchorDate,
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
        const anchorField = getDateFieldToPostpone(task);
        if (anchorField === null) {
            // No anchor yet - applying would still create one (see apply()), so this isn't a no-op.
            return false;
        }
        return task[anchorField]?.isSame(this.target, 'day') ?? false;
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
