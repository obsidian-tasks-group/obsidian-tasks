// @ts-ignore
import { Status } from '../../Status';
import type { Task } from '../../Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction class, for editing a {@link Task} object's {@link Priority}.
 */
export class SetStatus implements TaskEditingInstruction {
    private readonly newStatus: Status;

    constructor(status: Status) {
        this.newStatus = status;
    }

    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            // Unchanged: return the input task:
            return [task];
        } else {
            return task.handleNewStatusWithRecurrenceInUsersOrder(this.newStatus);
        }
    }

    public instructionDisplayName(): string {
        const commonTitle = 'Change status to:';
        return `${commonTitle} [${this.newStatus.symbol}] ${this.newStatus.name}`;
    }

    public isCheckedForTask(task: Task): boolean {
        return this.newStatus.symbol === task.status.symbol;
    }
}
