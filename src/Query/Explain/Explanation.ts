export class Explanation {
    public description: string;
    public children: Explanation[] | null;

    constructor(description: string, children: Explanation[] | null = null) {
        this.description = description;
        this.children = children;
    }
}
