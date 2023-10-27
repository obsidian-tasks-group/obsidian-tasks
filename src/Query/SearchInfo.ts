import type { Task } from '../Task';

/**
 * SearchInfo will soon contain selected data passed in from the {@link Query} being executed.
 *
 * This is the Parameter Object pattern: it is a container for information that needs
 * to be passed down through multiple levels of code, without having to update
 * the function signatures of all the layers in between.
 */
export class SearchInfo {
    /** The list of tasks being searched.
     */
    public readonly allTasks: Readonly<Task[]>;

    public constructor(allTasks: Task[]) {
        this.allTasks = [...allTasks];
    }
}
