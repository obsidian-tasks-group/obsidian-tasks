export class ListItem {
    /** The original line read from file.
     *
     * Will be empty if Task was created programmatically
     * (for example, by Create or Edit Task, or in tests, including via {@link TaskBuilder}). */
    public readonly originalMarkdown: string;

    public readonly parent: ListItem | null = null;
    public readonly children: ListItem[] = [];

    constructor(originalMarkdown: string, parent: ListItem | null) {
        this.originalMarkdown = originalMarkdown;
        this.parent = parent;

        if (parent !== null) {
            parent.children.push(this);
        }
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
}
