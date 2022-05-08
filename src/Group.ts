import { GroupHeadings, IntermediateTaskGroups } from './GroupDetails';
import type { Grouping, GroupingProperty } from './Query';
import type { Task } from './Task';

type Grouper = (task: Task) => string;

export class Group {
    /**
     * Group a list of tasks, according to one or more properties
     * @param grouping See GroupingProperty in Query.ts
     * @param tasks A list of Task objects
     */
    public static by(grouping: Grouping[], tasks: Task[]): TaskGroups {
        return new TaskGroups(grouping, tasks);
    }

    public static getGroupersForGroups(grouping: Grouping[]) {
        const groupers: Grouper[] = [];
        for (const { property } of grouping) {
            const comparator = Group.groupers[property];
            groupers.push(comparator);
        }
        return groupers;
    }

    public static getGroupNamesForTask(groupers: Grouper[], task: Task) {
        const keys = [];
        for (const grouper of groupers) {
            const this_key = grouper(task);
            keys.push(this_key);
        }
        return keys;
    }

    public static getGroupNameForTask(
        property: GroupingProperty,
        task: Task,
    ): string {
        const grouper = Group.groupers[property];
        return grouper(task);
    }

    private static groupers: Record<GroupingProperty, Grouper> = {
        filename: Group.groupByFileName,
        folder: Group.groupByFolder,
        heading: Group.groupByHeading,
        linktext: Group.groupByLinkText,
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
        const filename = task.filename;
        if (filename == null) {
            return 'Unknown Location';
        }
        return filename;
    }

    private static groupByLinkText(task: Task): string {
        const linkText = task.getLinkText({ isFilenameUnique: true });
        if (linkText == null) {
            return 'Unknown Location';
        }
        return linkText;
    }

    private static groupByStatus(task: Task): string {
        return task.status;
    }

    private static groupByHeading(task: Task): string {
        const defaultHeading = '(No heading)';
        if (task.precedingHeader == null) {
            return defaultHeading;
        }
        if (task.precedingHeader.length == 0) {
            return defaultHeading;
        }
        return task.precedingHeader;
    }
}

export class GroupHeading {
    // @ts-ignore
    public readonly level: number;
    // @ts-ignore
    public readonly title: string;

    constructor(level: number, title: string) {
        this.level = level;
        this.title = title;
    }
}

export class TaskGroup {
    constructor(
        groups: string[],
        groupHeadings: GroupHeading[],
        tasks: Task[],
    ) {
        this._groups = groups;
        this._groupHeadings = groupHeadings;
        this._tasks = tasks;
    }

    get groups(): string[] {
        return this._groups;
    }

    get groupHeadings(): GroupHeading[] {
        return this._groupHeadings;
    }

    get tasks(): Task[] {
        return this._tasks;
    }

    public tasksAsStringOfLines(): string {
        let output = '';
        for (const task of this.tasks) {
            output += task.toFileLineString() + '\n';
        }
        return output;
    }

    public toString(): string {
        let output = '\n';
        output += `Group names: [${this.groups}]\n`;

        for (const heading of this.groupHeadings) {
            // These headings mimic the behaviour of QueryRenderer,
            // which uses 'h4', 'h5' and 'h6' for nested groups.
            const headingPrefix = '#'.repeat(4 + heading.level);
            output += `${headingPrefix} ${heading.title}\n`;
        }

        output += this.tasksAsStringOfLines();
        return output;
    }

    private readonly _groups: string[];
    private readonly _groupHeadings: GroupHeading[];
    private readonly _tasks: Task[];
}

export class TaskGroups {
    constructor(grouping: Grouping[], tasks: Task[]) {
        const initialGroups = new IntermediateTaskGroups(grouping, tasks);
        this.addTasks(initialGroups);
    }

    addTasks(initialGroups: IntermediateTaskGroups) {
        // Get the headings
        const grouper = new GroupHeadings(initialGroups.groups);

        // Build a container of all the groups
        for (const [groups, tasks] of initialGroups.groups) {
            const groupHeadings = grouper.getHeadingsForTaskGroup(groups);
            const taskGroup = new TaskGroup(groups, groupHeadings, tasks);
            this.add(taskGroup);
        }
    }

    add(taskGroup: TaskGroup) {
        this._groups.push(taskGroup);
    }

    get groups(): TaskGroup[] {
        return this._groups;
    }

    totalTasksCount() {
        let totalTasksCount = 0;
        for (const group of this.groups) {
            totalTasksCount += group.tasks.length;
        }
        return totalTasksCount;
    }

    public toString(): string {
        let output = '';
        for (const taskGroup of this.groups) {
            output += taskGroup.toString();
            output += '\n---\n';
        }
        const totalTasksCount = this.totalTasksCount();
        output += `\n${totalTasksCount} tasks\n`;
        return output;
    }

    private _groups: TaskGroup[] = new Array<TaskGroup>();
}
