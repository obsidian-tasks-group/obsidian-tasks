import type { Task } from '../Task/Task';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * A subset of fields of {@link Task} that can be parsed from the textual
 * description of that Task.
 *
 * All fields are writeable for convenience.
 */
export type TaskDetails = Writeable<
    Pick<
        Task,
        // NEW_TASK_FIELD_EDIT_REQUIRED
        | 'description'
        | 'priority'
        | 'startDate'
        | 'createdDate'
        | 'scheduledDate'
        | 'dueDate'
        | 'doneDate'
        | 'cancelledDate'
        | 'recurrence'
        | 'dependsOn'
        | 'id'
        | 'tags'
    >
>;

/**
 * An abstraction that manages how a {@link Task} is read from and written
 * to a file.
 *
 * A {@link TaskSerializer} is only responsible for the single line of text that follows
 * after the checkbox:
 *
 *        - [ ] This is a task description
 *              ~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * {@link TaskSerializer} is not responsible for:
 *
 *        - Retrieving and setting a fallback scheduled date (done in {@link Task.fromLine})
 *
 * @exports
 * @interface TaskSerializer
 */
export interface TaskSerializer {
    /**
     * Parses task details from the string representation of a task
     *
     * @param line The single line of text to parse
     * @returns {TaskDetails} Details parsed from {@link line}
     */
    deserialize(line: string): TaskDetails;

    /**
     * Creates the string representation of a {@link Task}
     *
     * @param task The {@link Task} to stringify
     * @returns {string}
     */
    serialize(task: Task): string;
}

export { DefaultTaskSerializer } from './DefaultTaskSerializer';
