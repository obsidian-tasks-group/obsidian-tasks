import type { Task } from '../../Task/Task';

/**
 * An instruction interface, for editing a {@link Task} object.
 */
export interface TaskEditingInstruction {
    /**
     * Apply the edit to a copy of the given task.
     *
     * @note {@link Task} objects are immutable, so any edits are returned in a new task or tasks.
     * @param task
     * @returns An array of 0 or more tasks:
     *
     *            - Typically, this contains a single value, containing an edited copy of {@link task}.
     *            - An extra task would indicate that a new occurrence has been created.
     *            - An empty array would indicate to delete the task.
     *            - If no edit was made, the returned value will be an array of one element, which is the input task.
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
