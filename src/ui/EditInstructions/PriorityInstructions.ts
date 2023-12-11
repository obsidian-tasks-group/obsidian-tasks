import { Priority, Task } from '../../Task';
import { PriorityTools } from '../../lib/PriorityTools';

/**
 * An instruction class, for editing a {@link Task} object's {@link Priority}.
 */
export class SetPriority {
    readonly newPriority: Priority;

    constructor(priority: Priority) {
        this.newPriority = priority;
    }

    /**
     * Apply the edit to a copy of the given task.
     * @param task
     */
    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            // Unchanged: return the input task:
            return [task];
        } else {
            return [
                new Task({
                    ...task,
                    priority: this.newPriority,
                }),
            ];
        }
    }

    /**
     * Return the text to use for this instruction, in menus (and eventually, Obsidian commands)
     */
    public instructionDisplayName(): string {
        return `Priority: ${PriorityTools.priorityNameUsingNormal(this.newPriority)}`;
    }

    /**
     * Should a checkmark be shown on this instruction, for the given task.
     * @param task
     */
    public isCheckedForTask(task: Task) {
        return task.priority === this.newPriority;
    }
}

export function allPriorityInstructions() {
    const allPriorities = [
        Priority.Highest,
        Priority.High,
        Priority.Medium,
        Priority.None,
        Priority.Low,
        Priority.Lowest,
    ];
    const instructions = [];
    for (const priority of allPriorities) {
        instructions.push(new SetPriority(priority));
    }
    return instructions;
}
