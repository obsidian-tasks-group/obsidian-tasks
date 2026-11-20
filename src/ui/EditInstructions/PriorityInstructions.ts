import { Task } from 'Task/Task';
import { PriorityTools } from 'lib/PriorityTools';
import { Priority } from 'Task/Priority';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';
import { BaseTaskEditingInstruction } from 'ui/EditInstructions/BaseTaskEditingInstruction';

/**
 * An instruction class, for editing a {@link Task} object's {@link Priority}.
 */
export class SetPriority extends BaseTaskEditingInstruction {
    readonly newPriority: Priority;

    constructor(priority: Priority) {
        super();
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
        return `Change Priority to: ${PriorityTools.priorityNameUsingNormal(this.newPriority)}`;
    }

    public isCheckedForTask(task: Task) {
        return task.priority === this.newPriority;
    }

    public commandId(): string {
        return `set-priority-to-${PriorityTools.priorityNameUsingNormal(this.newPriority).toLowerCase()}`;
    }
}

const allPrioritiesHighestFirst = [
    Priority.Highest,
    Priority.High,
    Priority.Medium,
    Priority.None,
    Priority.Low,
    Priority.Lowest,
];

/**
 * An instruction class, for moving a {@link Task} object's {@link Priority} up or down by one level.
 *
 * Tasks already at the highest or lowest priority are left unchanged.
 */
export class ShiftPriority extends BaseTaskEditingInstruction {
    private readonly direction: 'increase' | 'decrease';

    constructor(direction: 'increase' | 'decrease') {
        super();
        this.direction = direction;
    }

    public apply(task: Task): Task[] {
        const offset = this.direction === 'increase' ? -1 : 1;
        const newIndex = allPrioritiesHighestFirst.indexOf(task.priority) + offset;
        if (newIndex < 0 || newIndex >= allPrioritiesHighestFirst.length) {
            // Unchanged: return the input task:
            return [task];
        }
        return new SetPriority(allPrioritiesHighestFirst[newIndex]).apply(task);
    }

    public instructionDisplayName(): string {
        return this.direction === 'increase' ? 'Increase Priority' : 'Decrease Priority';
    }

    public isCheckedForTask(_task: Task): boolean {
        return false;
    }

    public commandId(): string {
        return `${this.direction}-priority`;
    }
}

/**
 * Return all the available instructions for editing task priorities.
 */
export function allPriorityInstructions() {
    const allPriorities = allPrioritiesHighestFirst;
    const instructions: TaskEditingInstruction[] = [];
    for (const priority of allPriorities) {
        instructions.push(new SetPriority(priority));
    }
    instructions.push(new ShiftPriority('increase'), new ShiftPriority('decrease'));
    return instructions;
}

/**
 * Return a Task editing instruction that can be used to make any other tasks
 * have the same priority as the given task.
 */
export function createEditingInstructionForPriorityGroups(sampleTask: Task): TaskEditingInstruction {
    return new SetPriority(sampleTask.priority);
}
