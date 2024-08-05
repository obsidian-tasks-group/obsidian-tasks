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
     * Parses the parents recursively until a {@link ListItem} with a `null` parent is found.
     */
    get root(): ListItem {
        if (this.parent === null) {
            return this;
        }

        return this.parent.root;
    }

    /**
     * Checks whether this item has no parent.
     */
    get isRoot(): boolean {
        return this.parent === null;
    }
}
