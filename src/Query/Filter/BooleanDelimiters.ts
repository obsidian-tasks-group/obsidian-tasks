import { escapeRegExp } from '../../lib/RegExpTools';

export function anyOfTheseChars(allowedChars: string): string {
    return new RegExp('[' + escapeRegExp(allowedChars) + ']').source;
}

/**
 * A class to try to identify the type of delimiter used between Boolean operators.
 *
 * Note that this only checks the first and last non-operator characters on the line,
 * so where there is more than one binary operator, it is still possible for the user
 * to mix delimiters, and for the error to not be detected until later in the parsing process.
 */
export class BooleanDelimiters {
    public readonly openFilterChars;
    public readonly openFilter;

    public readonly closeFilterChars;
    public readonly closeFilter;

    public readonly openAndCloseFilterChars;

    constructor(openFilterChars: string, closeFilterChars: string, openAndCloseFilterChars: string) {
        this.openFilterChars = openFilterChars;
        this.closeFilterChars = closeFilterChars;
        this.openAndCloseFilterChars = openAndCloseFilterChars;

        this.openFilter = anyOfTheseChars(this.openFilterChars);
        this.closeFilter = anyOfTheseChars(this.closeFilterChars);
    }

    public static allSupportedDelimiters(): BooleanDelimiters {
        return new BooleanDelimiters('([{"', ')]}"', '()[]{}"');
    }

    public static fromInstructionLine(instruction: string) {
        const trimmedInstruction = instruction.trim();

        // We use a set of capitals and spaces as a short-cut to match AND, OR, NOT, AND NOT etc.
        // The only valid initial operator is NOT, so this may be worth tightening up, if
        // further tests show that it would be worthwhile.
        const findAnyInitialUnaryOperator = /^[A-Z ]*\s*(.*)/;
        const matches = findAnyInitialUnaryOperator.exec(trimmedInstruction);
        if (matches) {
            const instructionWithoutAnyLeadingOperators = matches[1];
            const firstChar = instructionWithoutAnyLeadingOperators[0];
            const lastChar = instructionWithoutAnyLeadingOperators.slice(-1);

            if (firstChar === '(' && lastChar === ')') {
                return new BooleanDelimiters('(', ')', '()');
            }

            if (firstChar === '[' && lastChar === ']') {
                return new BooleanDelimiters('[', ']', '[]');
            }

            if (firstChar === '{' && lastChar === '}') {
                return new BooleanDelimiters('{', '}', '{}');
            }

            if (firstChar === '"' && lastChar === '"') {
                return new BooleanDelimiters('"', '"', '"');
            }
        }

        throw new Error(
            "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
        );
    }
}
