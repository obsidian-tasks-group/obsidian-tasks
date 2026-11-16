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

export class ShiftPriority extends BaseTaskEditingInstruction {
    constructor() {
        super();
    }

    public apply(task: Task): Task[] {
        const offset = -1;
        const newIndex = allPrioritiesHighestFirst.indexOf(task.priority) + offset;
        if (newIndex < 0) {
            return [task];
        }
        return new SetPriority(allPrioritiesHighestFirst[newIndex]).apply(task);
    }

    public instructionDisplayName(): string {
        return 'Increase Priority';
    }

    public isCheckedForTask(_task: Task): boolean {
        return false;
    }

    public commandId(): string {
        return 'increase-priority';
    }
}

/**
 * Return all the available instructions for editing task priorities.
 * @todo Add instructions for increasing and decreasing the priority.
 */
export function allPriorityInstructions() {
    const allPriorities = allPrioritiesHighestFirst;
    const instructions = [];
    for (const priority of allPriorities) {
        instructions.push(new SetPriority(priority));
    }
    return instructions;
}

/**
 * Return a Task editing instruction that can be used to make any other tasks
 * have the same priority as the given task.
 */
export function createEditingInstructionForPriorityGroups(sampleTask: Task): TaskEditingInstruction {
    return new SetPriority(sampleTask.priority);
}
