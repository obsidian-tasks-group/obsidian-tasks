import type { Task } from '../Task';
import type { GroupingProperty } from './Query';
import { Group } from './Group';

/**
 * A naming function, that takes a Task object and returns the corresponding group property name
 */
export type GrouperFunction = (task: Task) => string[];

export class Grouper {
    public readonly grouper: GrouperFunction;

    private constructor(grouper: GrouperFunction) {
        this.grouper = grouper;
    }

    public static fromGroupingProperty(property: GroupingProperty): Grouper {
        return new Grouper(Group.grouperForProperty(property));
    }
}
