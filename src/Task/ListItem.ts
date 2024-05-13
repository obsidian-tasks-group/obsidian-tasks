export class ListItem {
    public readonly children: ListItem[];

    constructor(children: ListItem[]) {
        this.children = children;
    }
}
