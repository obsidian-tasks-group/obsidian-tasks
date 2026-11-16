// @ts-ignore
import { Status } from 'Statuses/Status';
import type { Task } from 'Task/Task';
import type { StatusRegistry } from 'Statuses/StatusRegistry';
import { StatusSettings } from 'Config/StatusSettings';
import { BaseTaskEditingInstruction } from 'ui/EditInstructions/BaseTaskEditingInstruction';

/**
 * An instruction class, for editing a {@link Task} object's {@link Status}.
 */
export class SetStatus extends BaseTaskEditingInstruction {
    public readonly newStatus: Status;

    constructor(status: Status) {
        super();
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

    public commandId(): string {
        // We want the command id to not change if a user renames the status.
        // And we also don't want to have to figure out how to handle duplicate status names.
        // So we use the single-character status symbol in the command id, avoiding using a space character.
        const symbolSlug = this.newStatus.symbol === ' ' ? 'space' : this.newStatus.symbol;
        return `set-status-symbol-to-${symbolSlug}`;
    }
}

/**
 * Return all the available instructions for editing task statuses.
 */
export function allStatusInstructions(statusRegistry: StatusRegistry) {
    const instructions: SetStatus[] = [];
    const coreStatuses = new StatusSettings().coreStatuses.map((setting) => setting.symbol);
    // Put the core statuses at the top of the menu:
    for (const matchCoreTask of [true, false]) {
        for (const status of statusRegistry.registeredStatuses) {
            if (coreStatuses.includes(status.symbol) === matchCoreTask) {
                instructions.push(new SetStatus(status));
            }
        }
    }
    return instructions;
}
