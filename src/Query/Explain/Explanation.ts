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
    public static booleanAnd(children: Explanation[]) {
        return new Explanation('All of', children);
    }

    /**
     * Create an Explanation object representing Boolean OR
     * @param children
     */
    public static booleanOr(children: Explanation[]) {
        return new Explanation('At least one of', children);
    }

    /**
     * Create an Explanation object representing Boolean NOT
     * @param children
     */
    public static booleanNot(children: Explanation[]) {
        return new Explanation('None of', children);
    }

    public asString() {
        return this.description;
    }
}
