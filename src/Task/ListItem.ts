import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from './Task';
import type { TaskLocation } from './TaskLocation';
import { TaskRegularExpressions } from './TaskRegularExpressions';

export class ListItem {
    // The original line read from file.
    public readonly originalMarkdown: string;

    public readonly parent: ListItem | null;
    public readonly children: ListItem[] = [];
    public readonly indentation: string;
    public readonly listMarker: string;
    public readonly description: string;
    public readonly statusCharacter: string | null;

    public readonly taskLocation: TaskLocation;

    constructor({
        originalMarkdown,
        indentation,
        listMarker,
        statusCharacter,
        description,
        parent,
        taskLocation,
    }: {
        originalMarkdown: string;
        indentation: string;
        listMarker: string;
        statusCharacter: string | null;
        description: string;
        parent: ListItem | null;
        taskLocation: TaskLocation;
    }) {
        this.indentation = indentation;
        this.listMarker = listMarker;
        this.statusCharacter = statusCharacter;
        this.description = description;
        this.originalMarkdown = originalMarkdown;

        this.parent = parent;
        if (parent !== null) {
            parent.children.push(this);
        }

        this.taskLocation = taskLocation;
    }

    public static fromListItemLine(originalMarkdown: string, parent: ListItem | null, taskLocation: TaskLocation) {
        const nonTaskMatch = RegExp(TaskRegularExpressions.nonTaskRegex).exec(originalMarkdown);
        let indentation = '';
        let listMarker = '';
        let statusCharacter = null;
        let description = '';
        if (nonTaskMatch) {
            indentation = nonTaskMatch[1];
            listMarker = nonTaskMatch[2];
            statusCharacter = nonTaskMatch[4] ?? null;
            description = nonTaskMatch[5].trim();
        }

        return new ListItem({
            originalMarkdown,
            indentation,
            listMarker,
            statusCharacter,
            description,
            taskLocation,
            parent,
        });
    }

    /**
     * Return the top-level parent of this list item or task,
     * which will not be indented.
     *
     * The root of an unintended item is itself.
     *
     * This is useful because the Tasks plugin currently only stores a flat list of {@link Task} objects,
     * and does not provide direct access to all the parsed {@link ListItem} objects.
     *
     * @see isRoot
     */
    get root(): ListItem {
        if (this.parent === null) {
            return this;
        }

        return this.parent.root;
    }

    /**
     * Returns whether this is a top-level (unindented) list item or task.
     *
     * @see root
     */
    get isRoot(): boolean {
        return this.parent === null;
    }

    /**
     * Find to find the closest parent that is a {@link Task}
     */
    public findClosestParentTask(): Task | null {
        let closestParentTask = this.parent;

        while (closestParentTask !== null) {
            // Lazy load the Task class to avoid circular dependencies
            const { Task } = require('./Task');
            if (closestParentTask instanceof Task) {
                return closestParentTask as Task;
            }
            closestParentTask = closestParentTask.parent;
        }

        return null;
    }

    get isTask() {
        return false;
    }

    /**
     * Compare all the fields in another ListItem, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * @note Use {@link Task.identicalTo} to compare {@link Task} objects.
     *
     * @param other - if this is in fact a {@link Task}, the result of false.
     */
    identicalTo(other: ListItem) {
        if (this.constructor.name !== other.constructor.name) {
            return false;
        }

        // Note: sectionStart changes every time a line is added or deleted before
        //       any of the tasks in a file. This does mean that redrawing of tasks blocks
        //       happens more often than is ideal.
        const args: Array<keyof ListItem> = [
            'originalMarkdown',
            'description',
            'statusCharacter',
            'path',
            'lineNumber',
            'sectionStart',
            'sectionIndex',
            'precedingHeader',
        ];

        for (const el of args) {
            if (this[el]?.toString() !== other[el]?.toString()) return false;
        }

        return ListItem.listsAreIdentical(this.children, other.children);
    }

    /**
     * Compare two lists of ListItem objects, and report whether their
     * contents, including any children, are identical and in the same order.
     *
     * This can be useful for optimising code if it is guaranteed that
     * there are no possible differences in the tasks in a file
     * after an edit, for example.
     *
     * If any field is different in any task or list item, it will return false.
     *
     * @param list1
     * @param list2
     */
    static listsAreIdentical(list1: ListItem[], list2: ListItem[]): boolean {
        if (list1.length !== list2.length) {
            return false;
        }

        return list1.every((item, index) => item.identicalTo(list2[index]));
    }

    public get path(): string {
        return this.taskLocation.path;
    }

    public get file(): TasksFile {
        return this.taskLocation.tasksFile;
    }

    /**
     * Return the name of the file containing this object, with the .md extension removed.
     */
    public get filename(): string | null {
        const fileNameMatch = this.path.match(/([^/]+)\.md$/);
        if (fileNameMatch !== null) {
            return fileNameMatch[1];
        } else {
            return null;
        }
    }

    public get lineNumber(): number {
        return this.taskLocation.lineNumber;
    }

    public get sectionStart(): number {
        return this.taskLocation.sectionStart;
    }

    public get sectionIndex(): number {
        return this.taskLocation.sectionIndex;
    }

    public get precedingHeader(): string | null {
        return this.taskLocation.precedingHeader;
    }

    public checkOrUncheck(): ListItem {
        const newStatusCharacter = this.statusCharacter === ' ' ? 'x' : ' ';
        const newMarkdown = this.originalMarkdown.replace(
            RegExp(TaskRegularExpressions.checkboxRegex),
            `[${newStatusCharacter}]`,
        );

        return ListItem.fromListItemLine(newMarkdown, null, this.taskLocation);
    }

    public toFileLineString(): string {
        const statusCharacterToString = this.statusCharacter ? `[${this.statusCharacter}] ` : '';
        return `${this.indentation}${this.listMarker} ${statusCharacterToString}${this.description}`;
    }
}
