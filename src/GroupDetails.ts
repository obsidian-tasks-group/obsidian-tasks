import { Group, GroupHeading } from './Group';
import type { Grouping } from './Query';
import type { Task } from './Task';

/*
 * This file contains implementation details of Group.ts
 */

/**
 * Explanation of the algorithms used here.
 *
 * The following text is taken from
 * https://discord.com/channels/686053708261228577/840286264964022302/955240812973809674
 *
 * The Problem
 * ===========
 *
 * Imagine that the user has supplied 3 'group by' instructions, and in order
 * to present the results, we simply concatenate the group names together
 * with '>'.
 *
 * So the display might look something like:
 *      #### 10.0 > 2022-03-20 > Some heading name
 *      - task 1
 *      - task 2
 *      #### 10.0 > 2022-03-22 > Some heading name
 *      - task 7
 *      - task 9
 *
 * The headings get very hard to read, very quickly.
 *
 * What we want instead is:
 *      #### 10.0
 *      ##### 2022-03-20
 *      ###### Some heading name
 *      - task 1
 *      - task 2
 *      ##### 2022-03-22
 *      ###### Some heading name
 *      - task 7
 *      - task 9
 *
 * I'm struggling to get my head around how, in TS, I can store something like a tree structure,
 * of arbitrary depth - to represent the grouped tasks.
 *
 * pjeby's answer
 * ==============
 *
 * User pjeby replied:
 * https://discord.com/channels/686053708261228577/840286264964022302/955579560034983946
 *
 * If all you're doing is generating headings, the simple algorithm would be to sort everything by a multi-value key -
 * i.e., [level 1, level 2, ..., item sort key] -- then iterate the whole list and output a heading for each level
 * where the value changed.
 *
 * i.e., you start with a [null, null, null, null....] "last seen" array and compare it item by item to the current
 * item's data, and output a heading of the correct level if there's a change, updating the item in your
 * "last seen" array.
 *
 * i.e. if the first item is different, output an H1 for the new value and set the rest of the array to null.
 * If the second item is also different, output an H2, save the value, set the rest to null, and so on.
 * After all the levels are checked, output the actual item.
 * If there are no changes, then basically you'll just be outputting the item.
 * No trees or graphs or whatnot needed.
 *
 * You could also just keep the last item and set a flag as soon as something doesn't match, and keep outputting
 * headings as soon as the flag is set.
 *
 * What the code does
 * ==================
 *
 * The IntermediateTaskGroups class below does the initial grouping and sorting.
 *
 * The GroupHeadings class below implements pjeby's heading detection algorithm, but instead of doing the printing directly,
 * it returns the calculated heading levels in an array of GroupHeading objects, for later use in QueryRenderer.ts.
 */

/**
 * Storage used for the initial grouping together of tasks.
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
            const groupers = Group.getGroupersForGroups(grouping);

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

/**
 * GroupHeadings calculates which headings need to be displayed, for
 * a given group of tasks.
 *
 * See the explanation in GroupDetails.ts for how it works.
 */
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
