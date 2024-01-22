import type { Task } from '../../Task/Task';
import type { SearchInfo } from '../SearchInfo';
import type { Grouper } from './Grouper';
import { GroupingTreeNode } from './GroupingTreeNode';
import type { TaskGroupingTreeStorage } from './TaskGroupingTreeStorage';

/*
 * A tree of tasks where every level in the tree corresponds to a grouping property.
 *
 * For example, if we have:
 * # Heading 1
 * - [ ] Task 1
 * # Heading 2
 * - [ ] Task 2
 * - [X] Task 3
 *
 * And we group by heading then status, the tree will look like:
 *
 *                   Root [T1, T2, T3]
 *                     /              \
 *              Heading 1 [T1]     Heading [T2, T3]
 *                   |               /        \
 *               TODO [T1]     TODO [T2]    Done [T3]
 *
 * The nice property of this tree is that every path from the root to a leaf, maps
 * to how the tasks will be rendered.
 *
 * NOTE: The same task can appear in multiple leaf nodes, if it matches multiple paths.
 */
class TaskGroupingTreeNode extends GroupingTreeNode<Task> {}

/**
 * TaskGroupingTree does the initial grouping together of tasks,
 * in arbitrary order. Caller is responsible for sorting groups in to desired order.
 *
 * It is essentially a thin wrapper around Map - see {@link TaskGroupingTreeStorage}.
 *
 * It is an implementation detail of the task-grouping code, and does not need to
 * be understood in order to group tasks.
 *
 * Ideally, this code would be simplified and moved in to TaskGroups.
 */
export class TaskGroupingTree {
    private root: TaskGroupingTreeNode;

    /**
     * Group a list of tasks, according to one or more task properties.
     * @param groupers 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     * @param searchInfo
     */
    constructor(groupers: Grouper[], tasks: Task[], searchInfo: SearchInfo) {
        // The root of the tree contains all the tasks.
        this.root = new TaskGroupingTreeNode(tasks);

        this.buildGroupingTree(groupers, searchInfo);
    }

    private buildGroupingTree(groupers: Grouper[], searchInfo: SearchInfo) {
        // The tree is build layer by layer, starting from the root.
        // At every level, we iterate on the nodes of that level to generate
        // the next one using the next grouping.

        let currentTreeLevel = [this.root];
        for (const grouper of groupers) {
            const nextTreeLevel = [];
            for (const currentTreeNode of currentTreeLevel) {
                for (const task of currentTreeNode.values) {
                    // Get properties of a task for the grouper
                    // The returned string is rendered, so special Markdown characters will be escaped
                    const groupNames = grouper.grouper(task, searchInfo);

                    if (groupNames.length === 0) {
                        // Create a fake empty group-name so that we can add these tasks
                        // to the tree. This group will be displayed with no heading.
                        // Without this, they would be lost and not displayed at all the query results.
                        groupNames.push('');
                    }

                    for (const groupName of groupNames) {
                        let child = currentTreeNode.children.get(groupName);
                        if (child === undefined) {
                            child = new TaskGroupingTreeNode([]);
                            currentTreeNode.children.set(groupName, child);
                            nextTreeLevel.push(child);
                        }
                        child.values.push(task);
                    }
                }
            }
            currentTreeLevel = nextTreeLevel;
        }
    }

    /** Generates an intermediate storage for the initial grouping together of tasks.
     *
     * @returns a map where the keys are the names of the groups
     * and the values are the tasks.
     */
    public generateTaskTreeStorage(): TaskGroupingTreeStorage {
        return this.root.generateAllPaths();
    }
}
