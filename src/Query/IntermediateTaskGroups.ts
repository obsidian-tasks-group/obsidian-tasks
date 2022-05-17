import type { Grouping } from '../Query';
import type { Task } from '../Task';
import { Group } from './Group';

/**
 * Storage used for the initial grouping together of tasks.
 *
 * The keys of the map are the names of the groups.
 * For example, one set of keys might be ['Folder Name/', 'File Name']
 * and the values would be all the matching Tasks from that file.
 */
export class IntermediateTaskGroupsStorage extends Map<string[], Task[]> {}

/**
 * IntermediateTaskGroups does the initial grouping together of tasks,
 * in alphabetical order by group names.
 *
 * It is essentially a thin wrapper around Map - see IntermediateTaskGroupsStorage.
 *
 * It is named "Intermediate" because its results are only temporary.
 * They will be discarded once the final TaskGroups object is created.
 *
 * Ideally, this code would be simplified and moved in to TaskGroups.
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
            const groupers = Group.getGroupersForAllQueryGroupings(grouping);

            for (const task of tasks as Task[]) {
                const groupNames = Group.getGroupNamesForTask(groupers, task);
                this.addTask(groupNames, task);
            }
            this.groups = this.getSortedGroups();
        }
    }

    private addTask(groupNames: string[], task: Task) {
        const groupForNames = this.getOrCreateGroupForGroupNames(groupNames);
        groupForNames?.push(task);
    }

    /**
     * If a task has been seen before with this exact combination of group names,
     * return the container that the previous task(s) were added to.
     *
     * Otherwise, create and return a new container.
     * @param newGroupNames
     * @private
     */
    private getOrCreateGroupForGroupNames(newGroupNames: string[]) {
        for (const [groupNames, taskGroup] of this.groups) {
            // Is there a better way to check if the contents of two string arrays
            // are identical?
            // Use of JSON feels inefficient, and is O(n-squared) on the number
            // of unique group-name combinations, so may scale badly if
            // very large numbers of tasks are displayed.
            // Related: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
            if (JSON.stringify(groupNames) === JSON.stringify(newGroupNames)) {
                return taskGroup;
            }
        }
        const taskGroup: Task[] = [];
        this.groups.set(newGroupNames, taskGroup);
        return taskGroup;
    }

    private getSortedGroups() {
        // groups.keys() will initially be in the order the entries were added,
        // so effectively random.
        // Return a duplicate map, with the keys (that is, group names) sorted in alphabetical order:
        return new IntermediateTaskGroupsStorage(
            [...this.groups.entries()].sort(),
        );
    }
}
