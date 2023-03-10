import type { Task } from '../Task';

/**
 * A naming function, that takes a Task object and returns the corresponding group property name
 */
export type GrouperFunction = (task: Task) => string[];

export type GroupingProperty =
    | 'backlink'
    | 'created'
    | 'done'
    | 'due'
    | 'filename'
    | 'folder'
    | 'happens'
    | 'heading'
    | 'path'
    | 'priority'
    | 'recurrence'
    | 'recurring'
    | 'root'
    | 'scheduled'
    | 'start'
    | 'status'
    | 'tags';

export class Grouper {
    public readonly property: string;
    public readonly grouper: GrouperFunction;

    constructor(property: string, grouper: GrouperFunction) {
        this.property = property;
        this.grouper = grouper;
    }
}
