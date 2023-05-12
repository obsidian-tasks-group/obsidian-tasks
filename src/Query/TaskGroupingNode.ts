import type { Task } from '../Task';
import type { TaskGroupingTreeStorage } from './TaskGroupingTree';

/**
 * A node in the grouping tree. The node contains the
 * list of values matching the path from the root so far, and its children
 * are the further grouping of those values.
 *
 */
export class TaskGroupingNode {
    children: Map<string, TaskGroupingNode> = new Map();
    values: Task[] = [];

    constructor(values: Task[]) {
        this.values = values;
    }

    /**
     * Recursively traverse the tree to generate all the paths to the leaves.
     * This function returns a map from every leaf path, to the list of values
     * matching this path.
     * NOTE: The node itself doesn't get included in the generated paths.
     */
    generateAllPaths(pathSoFar: string[] = []): TaskGroupingTreeStorage {
        const resultMap = new Map();
        if (this.children.size == 0) {
            // Base case: Leaf node. Populate the results map with the path to
            // this node, and the values that match this path.
            resultMap.set([...pathSoFar], this.values);
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
