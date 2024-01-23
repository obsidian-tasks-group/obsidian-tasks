import { Task } from '../../Task/Task';
import { PriorityTools } from '../../lib/PriorityTools';
import { Priority } from '../../Task/Priority';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction class, for editing a {@link Task} object's {@link Priority}.
 */
export class SetPriority implements TaskEditingInstruction {
    readonly newPriority: Priority;

    constructor(priority: Priority) {
        this.newPriority = priority;
    }

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

    public instructionDisplayName(): string {
        return `Priority: ${PriorityTools.priorityNameUsingNormal(this.newPriority)}`;
    }

    public isCheckedForTask(task: Task) {
        return task.priority === this.newPriority;
    }
}

/**
 * Return all the available instructions for editing task priorities.
 * @todo Add instructions for increasing and decreasing the priority.
 */
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
