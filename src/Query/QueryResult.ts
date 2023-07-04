import { TaskGroups } from './TaskGroups';
import type { TaskGroup } from './TaskGroup';

export class QueryResult {
    public readonly taskGroups: TaskGroups;
    private _searchErrorMessage: string | undefined = undefined;

    constructor(groups: TaskGroups) {
        this.taskGroups = groups;
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

    public get groups(): TaskGroup[] {
        return this.taskGroups.groups;
    }

    static fromError(message: string): QueryResult {
        const result = new QueryResult(new TaskGroups([], []));
        result._searchErrorMessage = message;
        return result;
    }
}
