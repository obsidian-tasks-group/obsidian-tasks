import type { Task } from '../Task/Task';
import { type QueryContext, makeQueryContextWithTasks } from '../Scripting/QueryContext';

/**
 * SearchInfo contains selected data passed in from the {@link Query} being executed.
 *
 * This is the Parameter Object pattern: it is a container for information that needs
 * to be passed down through multiple levels of code, without having to update
 * the function signatures of all the layers in between.
 */
export class SearchInfo {
    /** The list of tasks being searched.
     */
    public readonly allTasks: Readonly<Task[]>;
    public readonly queryPath: string | undefined;

    public constructor(queryPath: string | undefined, allTasks: Task[]) {
        this.queryPath = queryPath;
        this.allTasks = [...allTasks];
    }

    public static fromAllTasks(tasks: Task[]): SearchInfo {
        return new SearchInfo(undefined, tasks);
    }

    /**
     * Construct a {@link QueryContext} from this, for use in the placeholder
     * facility and scripting code.
     *
     * @return A QueryContext, or undefined if the path to the query file is unknown.
     */
    public queryContext(): QueryContext | undefined {
        return this.queryPath ? makeQueryContextWithTasks(this.queryPath, this.allTasks) : undefined;
    }
}
