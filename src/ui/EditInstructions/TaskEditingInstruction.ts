import type { Task } from '../../Task';

export interface TaskEditingInstruction {
    /**
     * Apply the edit to a copy of the given task.
     * @param task
     */
    apply(task: Task): Task[];

    /**
     * Return the text to use for this instruction, in menus (and eventually, Obsidian commands)
     */
    instructionDisplayName(): string;

    /**
     * Should a checkmark be shown on this instruction, for the given task.
     * @param task
     */
    isCheckedForTask(task: Task): boolean;
}
