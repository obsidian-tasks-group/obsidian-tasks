export class ListItem {
    public readonly children: ListItem[];
    public readonly parent: ListItem | null = null;

    constructor(children: ListItem[]) {
        this.children = children;
    }
}
