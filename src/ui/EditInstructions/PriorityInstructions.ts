import { Priority, Task } from '../../Task';

/**
 * An instruction class, for editing a {@link Task} object's {@link Priority}.
 */
export class SetPriority {
    private readonly newPriority: Priority;

    constructor(priority: Priority) {
        this.newPriority = priority;
    }

    /**
     * Apply the edit to a copy of the given task.
     * @param task
     */
    public apply(task: Task): Task[] {
        return [
            new Task({
                ...task,
                priority: this.newPriority,
            }),
        ];
    }
}
