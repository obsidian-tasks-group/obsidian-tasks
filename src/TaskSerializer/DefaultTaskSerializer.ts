import type { Task } from '../Task';
import type { TaskDetails, TaskSerializer } from '.';

export class DefaultTaskSerializer implements TaskSerializer {
    constructor() {}

    /* Convert a task to its string representation
     *
     * @param task The task to serialize
     *
     * @return The string representation of the task
     */
    public serialize(task: Task): string {
        task;
        throw new Error('Not implemented');
    }

    /* Try to parse Task Details from a string
     *
     * @param line The string to parse
     *
     * @return TaskDetails if parsing was successful, null otherwise
     */
    public deserialize(line: string): TaskDetails | null {
        line;
        throw new Error('Not implemented');
    }
}
