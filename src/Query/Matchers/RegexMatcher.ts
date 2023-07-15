import { Explanation } from '../Explain/Explanation';
import { IStringMatcher } from './IStringMatcher';

/**
 * Regular-expression-based implementation of IStringMatcher.
 */
export class RegexMatcher extends IStringMatcher {
    private readonly regex: RegExp;

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
     */
    public static validateAndConstruct(regexInput: string): RegexMatcher | null {
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

    explanation(instruction: string): Explanation {
        const intro = 'using regex: ';
        const regexAsString = `/${this.regex.source}/${this.regex.flags}`;
        const explanationText = alignRegexWithOriginalInstruction(instruction, intro, regexAsString);
        return new Explanation(explanationText);
    }
}

/**
 * Align the regex we are actually using with the regex in the original query.
 * For example, this creates the second line in this instruction/explanation pair:
 *
 * ```text
 * description regex matches /waiting|waits|wartet/ =>
 *   using regex:            /waiting|waits|wartet/
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
