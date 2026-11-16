import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';
import type { Task } from 'Task/Task';

/**
 * Base class for task editing instructions that will allow common implementations to be shared.
 */
export abstract class BaseTaskEditingInstruction implements TaskEditingInstruction {
    public abstract apply(task: Task): Task[];
    public abstract instructionDisplayName(): string;
    public abstract isCheckedForTask(task: Task): boolean;

    public commandId(): string {
        throw new Error(`${this.constructor.name}.commandId(): Method not implemented.`);
    }
}
