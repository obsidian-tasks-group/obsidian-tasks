import { Explanation } from '../Explain/Explanation';
import { IStringMatcher } from './IStringMatcher';

/**
 * Regular-expression-based implementation of IStringMatcher.
 */
export class RegexMatcher extends IStringMatcher {
    public readonly regex: RegExp;

    /**
     * Construct a RegexMatcher object.
     *
     * @param regex {RegExp} - A valid regular expression
     */
    public constructor(regex: RegExp) {
        super();
        this.regex = regex;
    }

    /**
     * Construct a RegexMatcher object if the supplied string is a valid regular expression.
     * and null if not.
     *
     * @param {string} regexInput - A string that can be converted to a regular expression.
     *                              It must begin with a /, and end either with / and optionally any
     *                              valid flags.
     * @throws {SyntaxError} Throws an exception if there was an error in {@link regexInput}.
     */
    public static validateAndConstruct(regexInput: string): RegexMatcher | null {
        // This expression has two parts.
        // 1. The regex source:  Match every character from the start of the line to
        //                       just before the final forward slash ('/').
        // 2. The flags, if any: Match every character after the last slash,
        //                       to the end of the line.
        const regexPattern = /^\/(.+)\/([^/]*)$/;
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

    public static helpMessage(): string {
        return String.raw`See https://publish.obsidian.md/tasks/Queries/Regular+Expressions

Regular expressions must look like this:
    /pattern/
or this:
    /pattern/flags

Where:
- pattern: The 'regular expression' pattern to search for.
- flags:   Optional characters that modify the search.
           i => make the search case-insensitive
           u => add Unicode support

Examples:  /^Log/
           /^Log/i
           /File Name\.md/
           /waiting|waits|waited/i
           /\d\d:\d\d/

The following characters have special meaning in the pattern:
to find them literally, you must add a \ before them:
    [\^$.|?*+()

CAUTION! Regular expression (or 'regex') searching is a powerful
but advanced feature that requires thorough knowledge in order to
use successfully, and not miss intended search results.
`;
    }

    public explanation(instruction: string): Explanation {
        const intro = 'using regex: ';
        const explanationText = alignRegexWithOriginalInstruction(instruction, intro, this.regexAsString());
        return new Explanation(explanationText);
    }

    private regexAsString() {
        let result = `'${this.regex.source}' with `;

        switch (this.regex.flags.length) {
            case 0:
                result += 'no flags';
                break;
            case 1:
                result += `flag '${this.regex.flags}'`;
                break;
            default:
                result += `flags '${this.regex.flags}'`;
                break;
        }

        return result;
    }
}

/**
 * Align the regex we are actually using with the regex in the original query.
 * For example, this creates the second line in this instruction/explanation pair:
 *
 * ```text
 * description regex matches /waiting|waits|wartet/ =>
 *   using regex:            'waiting|waits|wartet' with no flags
 * ```
 *
 * @param instruction
 * @param intro
 * @param regexAsString
 */
function alignRegexWithOriginalInstruction(instruction: string, intro: string, regexAsString: string) {
    const match = instruction.match(/\//);
    if (!match) {
        return 'Error explaining instruction. Could not find a slash character';
    }

    // The explanation will be indented 2 characters from the parent instruction,
    // so pad the explanation so that the start of the explained regex
    // aligns with the start of the regex in the original instruction.
    // This makes any differences in the regex much easier to spot.
    const indentation = 2;
    const startOfRegex = (match.index ?? indentation) - indentation;
    const prefixPadded = intro.padEnd(startOfRegex);
    return `${prefixPadded}${regexAsString}`;
}
