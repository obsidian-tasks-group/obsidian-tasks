export class ListItem {
    public readonly parent: ListItem | null = null;
    public readonly children: ListItem[];

    constructor(parent: ListItem | null, children: ListItem[]) {
        this.parent = parent;
        this.children = children;
    }
}
