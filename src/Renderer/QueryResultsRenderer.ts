import { MarkdownRenderChild } from 'obsidian';
import type { TasksFile } from '../Scripting/TasksFile';

export class QueryResultsRenderer extends MarkdownRenderChild {
    /**
     * The complete text in the instruction block, such as:
     * ```
     *   not done
     *   short mode
     * ```
     *
     * This does not contain the Global Query from the user's settings.
     * Use {@link getQueryForQueryRenderer} to get this value prefixed with the Global Query.
     */
    protected readonly source: string;

    // The path of the file that contains the instruction block, and cached data from that file.
    protected readonly tasksFile: TasksFile;

    constructor(container: HTMLElement, source: string, tasksFile: TasksFile) {
        super(container);

        this.source = source;
        this.tasksFile = tasksFile;
    }
}
