import type { Task } from '../Task/Task';
import { type QueryContext, makeQueryContextWithTasks } from '../Scripting/QueryContext';
import type { OptionalTasksFile } from '../Scripting/TasksFile';

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
    public readonly tasksFile: OptionalTasksFile;
    private readonly _queryContext: QueryContext | undefined;

    public constructor(tasksFile: OptionalTasksFile, allTasks: Task[]) {
        this.tasksFile = tasksFile;
        this.allTasks = [...allTasks];
        this._queryContext = this.tasksFile ? makeQueryContextWithTasks(this.tasksFile, this.allTasks) : undefined;
    }

    public static fromAllTasks(tasks: Task[]): SearchInfo {
        return new SearchInfo(undefined, tasks);
    }

    public get queryPath(): string | undefined {
        return this.tasksFile?.path ?? undefined;
    }

    /**
     * Construct a {@link QueryContext} from this, for use in the placeholder
     * facility and scripting code.
     *
     * @return A QueryContext, or undefined if the path to the query file is unknown.
     */
    public queryContext(): QueryContext | undefined {
        return this._queryContext;
    }
}
