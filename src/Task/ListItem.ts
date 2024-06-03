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
}
