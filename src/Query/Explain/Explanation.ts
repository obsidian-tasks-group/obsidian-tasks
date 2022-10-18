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

    /**
     * Create a string representation of the Explanation.
     *
     * Note that it will not have a final end-of-line character at the end.
     *
     * @param currentIndentation - This is an implementation detail. Users can ignore it.
     */
    public asString(currentIndentation: string = '') {
        let result = currentIndentation + this.description;
        if (this.children.length == 0) {
            // No children, so just return
            return result;
        }

        // We have children, so concatenate them together
        result += ':';
        const newIndentation = currentIndentation + '  ';
        for (let i = 0; i < this.children.length; i++) {
            result += `\n${this.children[i].asString(newIndentation)}`;
        }
        return result;
    }
}
