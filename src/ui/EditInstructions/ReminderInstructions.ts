import { Task } from '../../Task/Task';
import { getDateFieldToPostpone } from '../../DateTime/Postponer';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction to set the task's {@link Task.reminderTime} to a fixed 'HH:mm' value.
 *
 * See also {@link RemoveReminderTime}.
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
        return task.reminderTime === this.newReminderTime;
    }
}

/**
 * An instruction to set a task's reminder to a specific date and time, shifting the task's anchor date
 * (due, else scheduled, else start - the same priority {@link getDateFieldToPostpone} already uses) if
 * {@link target} falls on a different calendar day than it, and leaving the anchor untouched otherwise.
 *
 * Used for relative-offset picks ('in 30 minutes'), which carry a full date and time, unlike
 * {@link SetReminderTime}'s fixed clock time. If the task has no anchor date at all, only the reminder
 * time is set - a relative pick never creates a due date from nothing.
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
            return [new Task({ ...task, reminderTime: newReminderTime })];
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
            return true;
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
