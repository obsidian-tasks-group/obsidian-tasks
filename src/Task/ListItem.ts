import type { LinkCache } from 'obsidian';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from './Task';
import type { TaskLocation } from './TaskLocation';
import { TaskRegularExpressions } from './TaskRegularExpressions';
import type { Link } from './Link';
import { LinkResolver } from './LinkResolver';

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

    /**
     * Takes the given line from an Obsidian note and returns a ListItem object.
     *
     * @static
     * @param {string} originalMarkdown - The full line in the note to parse.
     * @param {ListItem | null} parent - The optional parent Task or ListItem of the new instance.
     * @param {TaskLocation} taskLocation - The location of the ListItem.
     * @return {ListItem | null}
     * @see Task.fromLine
     */
    public static fromListItemLine(
        originalMarkdown: string,
        parent: ListItem | null,
        taskLocation: TaskLocation,
    ): ListItem | null {
        const nonTaskMatch = RegExp(TaskRegularExpressions.nonTaskRegex).exec(originalMarkdown);
        if (!nonTaskMatch) {
            // In practice we never reach here, because the regexp matches any text even '', but the compiler doesn't know that.
            return null;
        }

        const listMarker = nonTaskMatch[2];
        if (listMarker === undefined) {
            return null;
        }

        return new ListItem({
            originalMarkdown,
            indentation: nonTaskMatch[1],
            listMarker,
            statusCharacter: nonTaskMatch[4] ?? null,
            description: nonTaskMatch[5].trim(),
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

        // Note: taskLocation changes every time a line is added or deleted before
        //       any of the tasks in a file. This does mean that redrawing of tasks blocks
        //       happens more often than is ideal.
        const args: Array<keyof ListItem> = ['description', 'statusCharacter', 'indentation', 'listMarker'];

        for (const el of args) {
            if (this[el]?.toString() !== other[el]?.toString()) return false;
        }

        if (!this.taskLocation.identicalTo(other.taskLocation)) return false;

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
     * Return a list of links in the body of the file containing
     * the task or list item.
     *
     * The data contest is documented here:
     * https://docs.obsidian.md/Reference/TypeScript+API/LinkCache
     */
    private get rawLinksInFileBody(): LinkCache[] {
        return this.file.cachedMetadata?.links ?? [];
    }

    /**
     * Return a list of links in the task or list item's line.
     */
    public get outlinks(): Readonly<Link[]> {
        return this.rawLinksInFileBody
            .filter((link) => link.position.start.line === this.lineNumber)
            .map((link) => LinkResolver.getInstance().resolve(link, this.file.path));
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
        if (this.statusCharacter === null) {
            return this;
        }

        const newStatusCharacter = this.statusCharacter === ' ' ? 'x' : ' ';
        const newMarkdown = this.originalMarkdown.replace(
            RegExp(TaskRegularExpressions.checkboxRegex),
            `[${newStatusCharacter}]`,
        );

        return new ListItem({
            ...this,
            originalMarkdown: newMarkdown,
            statusCharacter: newStatusCharacter,
            // The purpose of this method is just to update the status character on one single line in the file.
            // This will trigger an update, making Cache re-read the whole file,
            // which will then identify and re-create any parent-child relationships.
            parent: null,
        });
    }

    public toFileLineString(): string {
        const statusCharacterToString = this.statusCharacter ? `[${this.statusCharacter}] ` : '';
        return `${this.indentation}${this.listMarker} ${statusCharacterToString}${this.description}`;
    }
}
