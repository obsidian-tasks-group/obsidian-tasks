import type { TaskGroups } from './TaskGroups';

export class QueryResult {
    public readonly groups: TaskGroups;

    constructor(groups: TaskGroups) {
        this.groups = groups;
    }

    public get totalTasksCount(): number {
        return this.groups.totalTasksCount();
    }
}
