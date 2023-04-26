import type { Task } from '../Task';
import type { Grouper } from './Grouper';
import { GroupingTreeNode } from './GroupingTreeNode';

/**
 * Storage used for the initial grouping together of tasks.
 *
 * The keys of the map are the names of the groups.
 * For example, one set of keys might be ['Folder Name/', 'File Name']
 * and the values would be all the matching Tasks from that file.
 */
export class TaskGroupingTreeStorage extends Map<string[], Task[]> {}

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
 * in alphabetical order by group names.
 *
 * It is essentially a thin wrapper around Map - see {@link TaskGroupingTreeStorage}.
 *
 * It is an implementation detail of the task-grouping code, and does not need to
 * be understood in order to group tasks.
 *
 * Ideally, this code would be simplified and moved in to TaskGroups.
 */
export class TaskGroupingTree {
    public groups = new TaskGroupingTreeStorage();

    /**
     * Group a list of tasks, according to one or more task properties
     * @param groupers 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    constructor(groupers: Grouper[], tasks: Task[]) {
        const tree = this.buildGroupingTree(groupers, tasks);
        this.groups = tree.generateAllPaths();
        this.groups = this.getSortedGroups();
    }

    /**
     * Returns a grouping tree that groups the passed @tasks by the passed @groupers.
     */
    private buildGroupingTree(groupers: Grouper[], tasks: Task[]): TaskGroupingTreeNode {
        // The tree is build layer by layer, starting from the root.
        // At every level, we iterate on the nodes of that level to generate
        // the next one using the next grouping.

        // The root of the tree contains all the tasks.
        const root = new TaskGroupingTreeNode(tasks);

        let currentTreeLevel = [root];
        for (const grouper of groupers) {
            const nextTreeLevel = [];
            for (const currentTreeNode of currentTreeLevel) {
                for (const task of currentTreeNode.values) {
                    // Get properties of a task for the grouper
                    // The returned string is rendered, so special Markdown characters will be escaped
                    const groupNames = grouper.grouper(task);
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

        return root;
    }

    private getSortedGroups() {
        // groups.keys() will initially be in the order the entries were added,
        // so effectively random.
        // Return a duplicate map, with the keys (that is, group names) sorted in alphabetical order:
        return new TaskGroupingTreeStorage([...this.groups.entries()].sort());
    }
}
