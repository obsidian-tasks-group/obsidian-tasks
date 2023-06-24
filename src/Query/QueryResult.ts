import type { TaskGroups } from './TaskGroups';

export class QueryResult {
    public groups: TaskGroups;

    constructor(groups: TaskGroups) {
        this.groups = groups;
    }
}
