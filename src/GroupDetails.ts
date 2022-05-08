import { Group, GroupHeading } from './Group';
import type { Grouping } from './Query';
import type { Task } from './Task';

/*
 * This file contains implementation details of Group.ts
 */

/**
 * Storage used for the initial gruoping together of tasks.
 *
 * The keys of the map are the names of the groups.
 * For example, one set of keys might be ['Folder Name/', 'File Name']
 * and the values would be all the matching Tasks from that file.
 *
 * It would be nice to not export this, but at the time of writing,
 * it is used in some of the tests.
 */
export class IntermediateTaskGroupsStorage extends Map<string[], Task[]> {}

/**
 * IntermediateTaskGroups does the initial grouping together of tasks,
 * in alphabetical order by group names.
 *
 * It is essentially a thin wrapper around Map - see IntermediateTaskGroupsStorage.
 */
export class IntermediateTaskGroups {
    public groups = new IntermediateTaskGroupsStorage();

    /**
     * Group a list of tasks, according to one or more task properties
     * @param grouping 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    constructor(grouping: Grouping[], tasks: Task[]) {
        if (grouping.length === 0 || tasks.length === 0) {
            // There are no groups or no tasks: treat this as a single group,
            // with an empty group name.
            this.groups.set([], tasks);
        } else {
            const groupers = Group.getGroupersForGroups(grouping);

            for (const task of tasks as Task[]) {
                const keys = Group.getGroupNamesForTask(groupers, task);
                this.addTask(keys, task);
            }
            this.groups = this.getSortedGroups();
        }
    }

    private addTask(keys: string[], task: Task) {
        const groupForKey = this.getOrCreateGroupForKey(keys);
        groupForKey?.push(task);
    }

    private getOrCreateGroupForKey(newKey: string[]) {
        for (const [key, taskGroup] of this.groups) {
            // TODO Review for efficiency
            if (JSON.stringify(key) == JSON.stringify(newKey)) {
                return taskGroup;
            }
        }
        const taskGroup: Task[] = [];
        this.groups.set(newKey, taskGroup);
        return taskGroup;
    }

    private getSortedGroups() {
        // groups.keys() will be in the order the entries were added.
        // Return a duplicate map, with the keys sorted:
        // TODO This sorts urgency the wrong way round, with least urgent at the top
        return new IntermediateTaskGroupsStorage(
            [...this.groups.entries()].sort(),
        );
    }
}

export class GroupHeadings {
    private lastHeadingAtLevel = new Array<string>();

    constructor(groupedTasks: IntermediateTaskGroupsStorage) {
        const firstGroup = groupedTasks.keys().next().value;
        const groupCount = firstGroup.length;
        for (let i = 0; i < groupCount; i++) {
            this.lastHeadingAtLevel.push('');
        }
    }

    getHeadingsForTaskGroup(groups: string[]) {
        const headingsForGroup = new Array<GroupHeading>();
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (group != this.lastHeadingAtLevel[i]) {
                // console.log(i, group);
                headingsForGroup.push(new GroupHeading(i, group));
                // Reset all the lower heading levels to un-seen
                for (let j = i; j < groups.length; j++) {
                    this.lastHeadingAtLevel[j] = '';
                }
                this.lastHeadingAtLevel[i] = group;
            }
        }
        return headingsForGroup;
    }
}
