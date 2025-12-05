import { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import type { Filter } from './Filter/Filter';
import { TaskGroups } from './Group/TaskGroups';
import type { TaskGroup } from './Group/TaskGroup';
import { SearchInfo } from './SearchInfo';

function taskCountPluralised(tasksCount: number) {
    return `task${tasksCount !== 1 ? 's' : ''}`;
}

export class QueryResult {
    public readonly taskGroups: TaskGroups;
    public readonly totalTasksCountBeforeLimit: number = 0;

    private _searchErrorMessage: string | undefined = undefined;

    constructor(groups: TaskGroups, totalTasksCountBeforeLimit: number) {
        this.taskGroups = groups;
        this.totalTasksCountBeforeLimit = totalTasksCountBeforeLimit;
    }

    public get searchErrorMessage(): string | undefined {
        return this._searchErrorMessage;
    }

    private set searchErrorMessage(value: string | undefined) {
        this._searchErrorMessage = value;
    }

    public get totalTasksCount(): number {
        return this.taskGroups.totalTasksCount();
    }

    public totalTasksCountDisplayText() {
        const tasksCount = this.totalTasksCount;
        const tasksCountBeforeLimit = this.totalTasksCountBeforeLimit;
        if (tasksCount === tasksCountBeforeLimit) {
            return `${tasksCount} ${taskCountPluralised(tasksCount)}`;
        } else {
            return `${tasksCount} of ${tasksCountBeforeLimit} ${taskCountPluralised(tasksCountBeforeLimit)}`;
        }
    }

    public get groups(): TaskGroup[] {
        return this.taskGroups.groups;
    }

    static fromError(message: string): QueryResult {
        const result = new QueryResult(new TaskGroups([], [], SearchInfo.fromAllTasks([])), 0);
        result._searchErrorMessage = message;
        return result;
    }

    /**
     * This doesn't support nested results and list items.
     * TODO reimplement this with {@link MarkdownQueryResultsRenderer}
     *
     */
    public asMarkdown(): string {
        let markdown = '';

        markdown += this.taskGroups.groups // force line break
            .map((group) => this.toString(group))
            .join('');

        return markdown;
    }

    private toString(group: TaskGroup): string {
        let output = '\n';

        for (const heading of group.groupHeadings) {
            // These headings mimic the behaviour of QueryRenderer,
            // which uses 'h4', 'h5' and 'h6' for nested groups.
            const headingPrefix = '#'.repeat(Math.min(4 + heading.nestingLevel, 6));
            output += `${headingPrefix} ${heading.displayName}\n\n`;
        }

        output += this.tasksAsStringOfLines(group.tasks);
        return output;
    }

    private tasksAsStringOfLines(tasks: Task[]): string {
        let output = '';
        for (const task of tasks) {
            output += this.toFileLineString(task) + '\n';
        }
        return output;
    }

    /**
     * This is a duplicate of Task.toFileLineString() because tasks rendered in search results
     * do not necessarily have the same indentation and list markers as the source task lines.
     *
     * @param task
     */
    public toFileLineString(task: Task): string {
        return `- [${task.status.symbol}] ${task.toString()}`;
    }

    /**
     * This is known to not work reliably for filters that use query.allTasks and query.file.*
     *
     * @param filter
     */
    public applyFilter(filter: Filter): QueryResult {
        const queryResultTasks = this.taskGroups.groups.flatMap((group) => group.tasks);
        const searchInfo = new SearchInfo(new TasksFile('fix_me.md'), queryResultTasks);
        const filterFunction = (task: Task) => filter.filterFunction(task, searchInfo);
        const filteredTasks = [...new Set(queryResultTasks.filter(filterFunction))];

        return new QueryResult(
            new TaskGroups(this.taskGroups.groupers, filteredTasks, searchInfo),
            filteredTasks.length,
        );
    }
}
