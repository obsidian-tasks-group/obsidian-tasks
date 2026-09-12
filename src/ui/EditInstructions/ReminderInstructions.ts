import { Task } from '../../Task/Task';
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
