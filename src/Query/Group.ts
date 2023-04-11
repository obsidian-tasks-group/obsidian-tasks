import type { Task } from '../Task';
import { Priority } from '../Task';
import { TaskGroups } from './TaskGroups';
import { Grouper } from './Grouper';
import type { GrouperFunction, GroupingProperty } from './Grouper';

/**
 * Implementation of the 'group by' instruction.
 */
export class Group {
    public static fromGroupingProperty(property: GroupingProperty): Grouper {
        return new Grouper(property, Group.grouperForProperty(property));
    }

    /**
     * Group a list of tasks, according to one or more task properties
     * @param grouping 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    public static by(grouping: Grouper[], tasks: Task[]): TaskGroups {
        return new TaskGroups(grouping, tasks);
    }

    /**
     * Return the properties of a single task for the passed grouping property
     *
     * The returned string will be rendered, so any special Markdown characters will be escaped
     *
     * @param grouping
     * @param task
     */
    public static getGroupNamesForTask(grouping: Grouper, task: Task): string[] {
        return grouping.grouper(task);
    }

    public static grouperForProperty(property: GroupingProperty): GrouperFunction {
        return Group.groupers[property];
    }

    private static groupers: Record<GroupingProperty, GrouperFunction> = {
        backlink: Group.groupByBacklink,
        filename: Group.groupByFileName,
        folder: Group.groupByFolder,
        heading: Group.groupByHeading,
        path: Group.groupByPath,
        priority: Group.groupByPriority,
        recurrence: Group.groupByRecurrence,
        recurring: Group.groupByRecurring,
        root: Group.groupByRoot,
        status: Group.groupByStatus,
        tags: Group.groupByTags,
    };

    private static escapeMarkdownCharacters(filename: string) {
        // https://wilsonmar.github.io/markdown-text-for-github-from-html/#special-characters
        return filename.replace(/\\/g, '\\\\').replace(/_/g, '\\_');
    }

    private static groupByPriority(task: Task): string[] {
        let priorityName = 'ERROR';
        switch (task.priority) {
            case Priority.High:
                priorityName = 'High';
                break;
            case Priority.Medium:
                priorityName = 'Medium';
                break;
            case Priority.None:
                priorityName = 'None';
                break;
            case Priority.Low:
                priorityName = 'Low';
                break;
        }
        return [`Priority ${task.priority}: ${priorityName}`];
    }

    private static groupByRecurrence(task: Task): string[] {
        if (task.recurrence !== null) {
            return [task.recurrence!.toText()];
        } else {
            return ['None'];
        }
    }

    private static groupByRecurring(task: Task): string[] {
        if (task.recurrence !== null) {
            return ['Recurring'];
        } else {
            return ['Not Recurring'];
        }
    }

    private static groupByPath(task: Task): string[] {
        // Does this need to be made stricter?
        // Is there a better way of getting the file name?
        return [Group.escapeMarkdownCharacters(task.path.replace('.md', ''))];
    }

    private static groupByFolder(task: Task): string[] {
        const path = task.path;
        const fileNameWithExtension = task.filename + '.md';
        const folder = path.substring(0, path.lastIndexOf(fileNameWithExtension));
        if (folder === '') {
            return ['/'];
        }
        return [Group.escapeMarkdownCharacters(folder)];
    }

    private static groupByFileName(task: Task): string[] {
        // Note current limitation: Tasks from different notes with the
        // same name will be grouped together, even though they are in
        // different files and their links will look different.
        const filename = task.filename;
        if (filename === null) {
            return ['Unknown Location'];
        }
        return ['[[' + filename + ']]'];
    }

    private static groupByRoot(task: Task): string[] {
        const path = task.path.replace(/\\/g, '/');
        const separatorIndex = path.indexOf('/');
        if (separatorIndex == -1) {
            return ['/'];
        }
        return [Group.escapeMarkdownCharacters(path.substring(0, separatorIndex + 1))];
    }

    private static groupByBacklink(task: Task): string[] {
        const linkText = task.getLinkText({ isFilenameUnique: true });
        if (linkText === null) {
            return ['Unknown Location'];
        }

        let filenameComponent = 'Unknown Location';

        if (task.filename !== null) {
            // Markdown characters in the file name must be escaped.
            filenameComponent = Group.escapeMarkdownCharacters(task.filename);
        }

        if (task.precedingHeader === null || task.precedingHeader.length === 0) {
            return [filenameComponent];
        }

        // Markdown characters in the heading must NOT be escaped.
        const headingComponent = Group.groupByHeading(task)[0];

        if (filenameComponent === headingComponent) {
            return [filenameComponent];
        } else {
            return [`${filenameComponent} > ${headingComponent}`];
        }
    }

    private static groupByStatus(task: Task): string[] {
        // Backwards-compatibility note: In Tasks 1.22.0 and earlier, the only
        // names used by 'group by status' were 'Todo' and 'Done' - and
        // any character other than a space was considered to be 'Done'.
        if (task.status.symbol === ' ') {
            return ['Todo'];
        } else {
            return ['Done'];
        }
    }

    private static groupByHeading(task: Task): string[] {
        if (task.precedingHeader === null || task.precedingHeader.length === 0) {
            return ['(No heading)'];
        }
        return [task.precedingHeader];
    }

    private static groupByTags(task: Task): string[] {
        if (task.tags.length == 0) {
            return ['(No tags)'];
        }
        return task.tags;
    }
}
