export class Explanation {
    public description: string;
    public children: Explanation[] | null;

    constructor(description: string, children: Explanation[] | null = null) {
        this.description = description;
        this.children = children;
    }

    /**
     * Create an Explanation object representing Boolean AND
     * @param children
     */
    public static allOf(children: Explanation[]) {
        return new Explanation('All Of', children);
    }

    /**
     * Create an Explanation object representing Boolean OR
     * @param children
     */
    public static booleanOr(children: Explanation[]) {
        return new Explanation('At least one of', children);
    }
}
