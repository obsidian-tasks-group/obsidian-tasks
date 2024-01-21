import type { Task } from '../../Task/Task';
import type { GroupDisplayHeading } from './GroupDisplayHeading';

/**
 * Store a single group of tasks, that all share the same group names.
 * {@link TaskGroup} objects are stored in a {@link TaskGroups} object.
 *
 * For example, if the user supplied these 'group by' lines:
 *   group by folder
 *   group by filename
 *   group by heading
 * Then the names of one {@link TaskGroup} might be this:
 *   Some/Folder/In/The/Vault
 *   A Particular File Name
 *   My lovely heading
 * And the {@link TaskGroup} would store all the tasks from that location
 * that match the task block's filters, in the task block's sort order
 */
export class TaskGroup {
    /**
     * The full list of names of the group properties for this set of tasks,
     * in the order of the 'group by' lines the user specified.
     *
     * If there were no 'group by' instructions in the tasks code block,
     * this will be empty.
     *
     * Note that the strings returned contain markdown for rendering,
     * if required.
     */
    public readonly groups: string[];

    /**
     * The headings to be displayed in front of this set of tasks,
     * when rendering the results.
     *
     * It only contains the minimal set of headings required to separate
     * this group of tasks from the previous group of tasks.
     *
     * If this group of tasks has the same first-level heading as the previous
     * group of tasks, there is no need to display that first-level heading
     * to separate these tasks from the previous group.
     *
     * If there were no 'group by' instructions in the tasks code block,
     * this will be empty.
     */
    public readonly groupHeadings: GroupDisplayHeading[];

    /**
     * All the tasks that match the user's filters and that have the
     * group names exactly matching groups().
     */
    public tasks: Task[];

    /**
     * Constructor
     * @param {string[]} groups - See {@link groups} for details
     * @param tasks {Task[]} - See {@link tasks} for details
     */
    constructor(groups: string[], tasks: Task[]) {
        this.groups = groups;
        this.groupHeadings = [];
        this.tasks = tasks;
    }

    public setGroupHeadings(headingsForTaskGroup: GroupDisplayHeading[]) {
        for (const groupDisplayHeading of headingsForTaskGroup) {
            this.groupHeadings.push(groupDisplayHeading);
        }
    }

    /**
     * Limits {@link tasks} array to a certain number. Tasks exceeding
     * the limit will be removed from the end, shall be called on sorted tasks.
     *
     * @param limit number of tasks for the group to have. If greater
     * than the task count, no action will be taken.
     *
     */
    public applyTaskLimit(limit: number) {
        this.tasks = this.tasks.slice(0, limit);
    }

    /**
     * A markdown-format representation of all the tasks in this group.
     *
     * Useful for testing.
     */
    public tasksAsStringOfLines(): string {
        let output = '';
        for (const task of this.tasks) {
            output += task.toFileLineString() + '\n';
        }
        return output;
    }

    /**
     * A human-readable representation of this task group, including names
     * and headings that should be displayed.
     *
     * Note that this is used in snapshot testing, so if the format is
     * changed, the snapshots will need to be updated.
     */
    public toString(): string {
        let output = '\n';
        output += `Group names: [${this.groups}]\n`;

        for (const heading of this.groupHeadings) {
            // These headings mimic the behaviour of QueryRenderer,
            // which uses 'h4', 'h5' and 'h6' for nested groups.
            const headingPrefix = '#'.repeat(4 + heading.nestingLevel);
            output += `${headingPrefix} [${heading.property}] ${heading.displayName}\n`;
        }

        output += this.tasksAsStringOfLines();
        return output;
    }
}
