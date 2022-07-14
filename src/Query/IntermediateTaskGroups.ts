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
 * A node in the grouping tree. The node contains the
 * list of tasks matching the path from the root so far, and its children
 * are the further grouping of those tasks.
 *
 * Check the docs of @GroupingTree for more details.
 *
 */
class GroupingTreeNode {
    children: Map<string, GroupingTreeNode> = new Map();
    tasks: Task[] = [];

    /**
     * Recursively traverse the tree to generate all the paths to the leaves.
     * This function returns a map from every leaf path, to the list of tasks
     * matching this path.
     */
    generateAllPaths(pathSoFar: string[] = []): IntermediateTaskGroupsStorage {
        const resultMap = new IntermediateTaskGroupsStorage();
        if (this.children.size == 0) {
            // Base case: Leaf node. Populate the results map with the path to
            // this node, and the tasks that match this path.
            resultMap.set([...pathSoFar], this.tasks);
            return resultMap;
        }

        for (const [property, child] of this.children) {
            pathSoFar.push(property);
            const childResult = child.generateAllPaths(pathSoFar);
            childResult.forEach((value, key) => resultMap.set(key, value));
            pathSoFar.pop();
        }
        return resultMap;
    }
}

/**
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
type GroupingTree = GroupingTreeNode;

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
     * @param groupings 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    constructor(groupings: Grouping[], tasks: Task[]) {
        const tree = this.buildGroupingTree(groupings, tasks);
        this.groups = tree.generateAllPaths();
        this.groups = this.getSortedGroups();
    }

    /**
     * Returns a grouping tree that groups the passed @tasks by the passed @groupings.
     */
    private buildGroupingTree(
        groupings: Grouping[],
        tasks: Task[],
    ): GroupingTree {
        // The tree is build layer by layer, starting from the root.
        // At every level, we iterate on the nodes of that level to generate
        // the next one using the next grouping.

        // The root of the tree contains all the tasks.
        const root = new GroupingTreeNode();
        root.tasks = tasks;

        let currentTreeLevel = [root];
        for (const grouping of groupings) {
            const nextTreeLevel = [];
            for (const currentTreeNode of currentTreeLevel) {
                for (const task of currentTreeNode.tasks) {
                    const groupNames = Group.getGroupNamesForTask(
                        grouping.property,
                        task,
                    );
                    for (const groupName of groupNames) {
                        let child = currentTreeNode.children.get(groupName);
                        if (child === undefined) {
                            child = new GroupingTreeNode();
                            currentTreeNode.children.set(groupName, child);
                            nextTreeLevel.push(child);
                        }
                        child.tasks.push(task);
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
        return new IntermediateTaskGroupsStorage(
            [...this.groups.entries()].sort(),
        );
    }
}
