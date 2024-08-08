import { MarkdownRenderChild } from 'obsidian';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { getQueryForQueryRenderer } from '../lib/QueryRendererHelper';
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

    protected query: IQuery;
    protected queryType: string; // whilst there is only one query type, there is no point logging this value

    constructor(container: HTMLElement, source: string, tasksFile: TasksFile) {
        super(container);

        this.source = source;
        this.tasksFile = tasksFile;

        // The engine is chosen on the basis of the code block language. Currently,
        // there is only the main engine for the plugin, this allows others to be
        // added later.
        switch (this.containerEl.className) {
            case 'block-language-tasks':
                this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.tasksFile);
                this.queryType = 'tasks';
                break;

            default:
                this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.tasksFile);
                this.queryType = 'tasks';
                break;
        }
    }
}
