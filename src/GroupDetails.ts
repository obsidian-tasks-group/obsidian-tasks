import { Group, GroupHeading } from './Group';
import type { Grouping } from './Query';
import type { Task } from './Task';

export class IntermediateTaskGroupsStorage extends Map<string[], Task[]> {}

export class IntermediateTaskGroups {
    public groups = new IntermediateTaskGroupsStorage();

    public static getIntermediateTaskGroupsStorage(
        grouping: Grouping[],
        tasks: Task[],
    ): IntermediateTaskGroupsStorage {
        if (grouping.length === 0 || tasks.length === 0) {
            // There are no groups or no tasks: treat this as a single group,
            // with an empty group name.
            const groups = new IntermediateTaskGroupsStorage();
            groups.set([], tasks);
            return groups;
        }
        const groupers = Group.getGroupersForGroups(grouping);

        const groups = new IntermediateTaskGroups();
        for (const task of tasks as Task[]) {
            const keys = Group.getGroupNamesForTask(groupers, task);
            groups.addTask(keys, task);
        }
        return groups.getSortedGroups();
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
