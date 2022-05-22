import type { Grouping, GroupingProperty } from '../Query';
import type { Task } from '../Task';
import { TaskGroups } from './TaskGroups';

/**
 * A naming function, that takes a Task object and returns the corresponding group property name
 */
type Grouper = (task: Task) => string;

/**
 * Implementation of the 'group by' instruction.
 */
export class Group {
    /**
     * Group a list of tasks, according to one or more task properties
     * @param grouping 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    public static by(grouping: Grouping[], tasks: Task[]): TaskGroups {
        return new TaskGroups(grouping, tasks);
    }

    /**
     * Return the Grouper functions matching the 'group by' lines
     * @param grouping 0 or more Grouping values, one per 'group by' line
     */
    public static getGroupersForAllQueryGroupings(grouping: Grouping[]) {
        const groupers: Grouper[] = [];
        for (const { property } of grouping) {
            const comparator = Group.groupers[property];
            groupers.push(comparator);
        }
        return groupers;
    }

    /**
     * Return the group names for a single task
     * @param groupers The Grouper functions indicating the requested types of group
     * @param task
     */
    public static getGroupNamesForTask(groupers: Grouper[], task: Task) {
        const groupNames = [];
        for (const grouper of groupers) {
            const groupName = grouper(task);
            groupNames.push(groupName);
        }
        return groupNames;
    }

    /**
     * Return a single property name for a single task.
     * A convenience method for unit tests.
     * @param property
     * @param task
     */
    public static getGroupNameForTask(
        property: GroupingProperty,
        task: Task,
    ): string {
        const grouper = Group.groupers[property];
        return grouper(task);
    }

    private static groupers: Record<GroupingProperty, Grouper> = {
        backlink: Group.groupByBacklink,
        filename: Group.groupByFileName,
        folder: Group.groupByFolder,
        heading: Group.groupByHeading,
        path: Group.groupByPath,
        status: Group.groupByStatus,
    };

    private static groupByPath(task: Task): string {
        // Does this need to be made stricter?
        // Is there a better way of getting the file name?
        return task.path.replace('.md', '');
    }

    private static groupByFolder(task: Task): string {
        const path = task.path;
        const fileNameWithExtension = task.filename + '.md';
        const folder = path.substring(
            0,
            path.lastIndexOf(fileNameWithExtension),
        );
        if (folder === '') {
            return '/';
        }
        return folder;
    }

    private static groupByFileName(task: Task): string {
        // Note current limitation: Tasks from different notes with the
        // same name will be grouped together, even though they are in
        // different files and their links will look different.
        const filename = task.filename;
        if (filename === null) {
            return 'Unknown Location';
        }
        return filename;
    }

    private static groupByBacklink(task: Task): string {
        const linkText = task.getLinkText({ isFilenameUnique: true });
        if (linkText === null) {
            return 'Unknown Location';
        }
        return linkText;
    }

    private static groupByStatus(task: Task): string {
        return task.status.name;
    }

    private static groupByHeading(task: Task): string {
        if (
            task.precedingHeader === null ||
            task.precedingHeader.length === 0
        ) {
            return '(No heading)';
        }
        return task.precedingHeader;
    }
}
