import type { IStringMatcher } from './IStringMatcher';

/**
 * Regular-expression-based implementation of IStringMatcher.
 */
export class RegexMatcher implements IStringMatcher {
    private readonly regex: RegExp;

    /**
     * Construct a RegexMatcher object.
     *
     * @param regex {RegExp} - A valid regular expression
     */
    public constructor(regex: RegExp) {
        this.regex = regex;
    }

    /**
     * Construct a RegexMatcher object if the supplied string is a valid regular expression.
     * and null if not.
     *
     * @param {string} regexInput - A string that can be converted to a regular expression.
     *                              It must begin with a /, and end either with / and optionally any
     *                              valid flags.
     */
    public static validateAndConstruct(
        regexInput: string,
    ): RegexMatcher | null {
        // Courtesy of https://stackoverflow.com/questions/17843691/javascript-regex-to-match-a-regex
        const regexPattern =
            /\/((?![*+?])(?:[^\r\n[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/;
        const query = regexInput.match(regexPattern);

        if (query !== null) {
            const regExp = new RegExp(query[1], query[2]);
            return new RegexMatcher(regExp);
        } else {
            return null;
        }
    }

    public matches(stringToSearch: string): boolean {
        return stringToSearch.match(this.regex) !== null;
    }
}
