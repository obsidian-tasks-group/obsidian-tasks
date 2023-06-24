import type { TaskGroups } from './TaskGroups';
import type { TaskGroup } from './TaskGroup';

export class QueryResult {
    public readonly taskGroups: TaskGroups;

    constructor(groups: TaskGroups) {
        this.taskGroups = groups;
    }

    public get totalTasksCount(): number {
        return this.taskGroups.totalTasksCount();
    }

    public get groups(): TaskGroup[] {
        return this.taskGroups.groups;
    }
}
