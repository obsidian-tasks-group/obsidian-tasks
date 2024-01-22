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
}
