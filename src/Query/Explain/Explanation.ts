export class Explanation {
    public description: string;
    public children: Explanation[];

    constructor(description: string, children: Explanation[] = []) {
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
        let result = this.description;
        if (this.children.length == 0) {
            // No children, so just return
            return result;
        }

        // We have children, so concatenate them together
        result += ':\n';
        for (let i = 0; i < this.children.length; i++) {
            result += `  ${this.children[i].description}\n`;
        }
        return result;
    }
}
