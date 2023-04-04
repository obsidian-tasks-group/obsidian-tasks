/**
 * An Explanation object stores a text description of a Query instruction, or a component of one.
 *
 * It supports Boolean combinations via the {@link children} field.
 *
 * Initially, the {@link description} will simply restate the instruction filter.
 * Later, more human-readable descriptions will be generated.
 */
export class Explanation {
    public readonly description: string;
    public readonly symbol: string; // AND, OR, NOT, XOR
    public readonly children: Explanation[];

    constructor(description: string, children: Explanation[] = [], symbol: string = '') {
        this.description = description;
        this.symbol = symbol;
        this.children = children;
    }

    /**
     * Create an Explanation object representing Boolean AND
     * @param children
     */
    public static booleanAnd(children: Explanation[]) {
        return this.combineOrCreateExplanation('All of', children, 'AND');
    }

    /**
     * Create an Explanation object representing Boolean OR
     * @param children
     */
    public static booleanOr(children: Explanation[]) {
        return this.combineOrCreateExplanation('At least one of', children, 'OR');
    }

    /**
     * Create an Explanation object representing Boolean NOT
     * @param children
     */
    public static booleanNot(children: Explanation[]) {
        return new Explanation('None of', children, 'NOT');
    }

    /**
     * Create an Explanation object representing Boolean XOR
     * @param children
     */
    public static booleanXor(children: Explanation[]) {
        return new Explanation('Exactly one of', children, 'XOR');
    }

    /**
     * Create a string representation of the Explanation.
     *
     * Note that it will not have a final end-of-line character at the end.
     *
     * @param currentIndentation - This is an implementation detail. Users can ignore it.
     */
    public asString(currentIndentation: string = '') {
        if (this.children.length == 0) {
            return currentIndentation + this.description;
        }

        let result = currentIndentation;

        if (this.symbol === '') {
            // If the symbol was not set, add the description and just indent
            result += this.description;
        } else {
            // Otherwise we need detailed explanation with logic
            result += this.symbol;

            // We have children, so concatenate them together
            if (this.children.length > 1) {
                // The descriptions like 'All of', 'None of' are one really meaningful
                // if there is more than one filter. Otherwise, they are just confusing.
                result += ` (${this.description})`;
            }
            result += ':';
        }

        const newIndentation = currentIndentation + '  ';
        for (let i = 0; i < this.children.length; i++) {
            result += `\n${this.children[i].asString(newIndentation)}`;
        }
        return result;
    }

    private static combineOrCreateExplanation(description: string, children: Explanation[], symbol: string) {
        if (children.length === 2) {
            const child0 = children[0];
            const child1 = children[1];
            if (child0.symbol === symbol && child1.symbol === '') {
                child0.children.push(child1);
                return child0;
            }
        }
        return new Explanation(description, children, symbol);
    }
}
