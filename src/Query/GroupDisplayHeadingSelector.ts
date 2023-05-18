import { GroupDisplayHeading } from './GroupDisplayHeading';
import type { Grouper } from './Grouper';
import type { TaskGroupingTreeStorage } from './TaskGroupingTreeStorage';

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
 * The TaskGroupingTree class below does the initial grouping and sorting.
 *
 * The GroupDisplayHeadingSelector class below implements pjeby's heading detection algorithm, but instead of doing the printing directly,
 * it returns the calculated heading levels in an array of GroupDisplayHeading objects, for later use in QueryRenderer.ts.
 */

/**
 * GroupDisplayHeadingSelector calculates which headings need to be displayed, for
 * a given group of tasks.
 *
 * It selects which {@link GroupDisplayHeading} objects to create.
 *
 * See the explanation in GroupDisplayHeadingSelector.ts for how it works.
 */
export class GroupDisplayHeadingSelector {
    private lastHeadingAtLevel = new Array<string>();
    private groupers: Grouper[];

    constructor(taskGroupingTreeStorage: TaskGroupingTreeStorage, groupers: Grouper[]) {
        this.groupers = groupers;
        const firstGroup = taskGroupingTreeStorage.keys().next().value;
        const groupCount = firstGroup.length;
        for (let i = 0; i < groupCount; i++) {
            this.lastHeadingAtLevel.push('');
        }
    }

    /**
     * Calculate the minimal set of headings that should be displayed
     * before the tasks with the given group names.
     *
     * Data for each required heading is stored in a GroupDisplayHeading object.
     * @param groupNames 0 or more group names, one per 'group by' line
     */
    getHeadingsForTaskGroup(groupNames: string[]): GroupDisplayHeading[] {
        // See 'pjeby's answer' above for an explanation of this algorithm.
        const headingsForGroup = new Array<GroupDisplayHeading>();
        for (let level = 0; level < groupNames.length; level++) {
            const group = groupNames[level];
            if (group != this.lastHeadingAtLevel[level]) {
                headingsForGroup.push(new GroupDisplayHeading(level, group, this.groupers[level].property));
                // Reset all the lower heading levels to un-seen
                for (let j = level; j < groupNames.length; j++) {
                    this.lastHeadingAtLevel[j] = '';
                }
                this.lastHeadingAtLevel[level] = group;
            }
        }
        return headingsForGroup;
    }
}
