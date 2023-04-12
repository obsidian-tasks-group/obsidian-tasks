import type { Task } from '../Task';
import { TaskGroups } from './TaskGroups';
import { Grouper } from './Grouper';
import type { GrouperFunction, GroupingProperty } from './Grouper';
import { HeadingField } from './Filter/HeadingField';

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
        folder: Group.groupByFolder,
        root: Group.groupByRoot,
    };

    public static escapeMarkdownCharacters(filename: string) {
        // https://wilsonmar.github.io/markdown-text-for-github-from-html/#special-characters
        return filename.replace(/\\/g, '\\\\').replace(/_/g, '\\_');
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
        const headingGrouper = new HeadingField().createGrouper().grouper;
        const headingComponent = headingGrouper(task)[0];

        if (filenameComponent === headingComponent) {
            return [filenameComponent];
        } else {
            return [`${filenameComponent} > ${headingComponent}`];
        }
    }
}
