import safe from 'safe-regex2';

const MAX_REGEX_PATTERN_LENGTH = 500;

/**
 * Check whether a regular expression pattern is safe from catastrophic backtracking (ReDoS).
 *
 * Uses the {@link https://github.com/fastify/safe-regex2 | safe-regex2} library to detect
 * patterns with a star height greater than 1 (nested quantifiers such as `(a+)+`),
 * which can cause exponential matching time against certain inputs.
 *
 * Also enforces a maximum pattern length as defense-in-depth.
 *
 * @param pattern - The regex source string (without surrounding slashes or flags).
 * @returns `null` if the pattern is safe, or a string describing the problem if it is unsafe.
 */
export function validateRegExpSafety(pattern: string): string | null {
    if (pattern.length > MAX_REGEX_PATTERN_LENGTH) {
        return `Regular expression pattern is too long (${pattern.length} characters, maximum ${MAX_REGEX_PATTERN_LENGTH}).`;
    }

    if (!safe(pattern, { limit: 25 })) {
        return `Regular expression /${pattern}/ may cause performance problems (possible catastrophic backtracking detected).`;
    }

    return null;
}

/**
 * Escape a string so it can be used as part of a RegExp literally.
 * Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
export function escapeRegExp(s: string) {
    // NOTE: = is not escaped, as doing so gives error:
    //         Invalid regular expression: /(^|\s)hello\=world($|\s)/: Invalid escape
    // NOTE: ! is not escaped, as doing so gives error:
    //         Invalid regular expression: /(^|\s)hello\!world($|\s)/: Invalid escape
    // NOTE: : is not escaped, as doing so gives error:
    //         Invalid regular expression: /(^|\s)hello\:world($|\s)/: Invalid escape
    //
    // Explanation from @AnnaKornfeldSimpson in:
    // https://github.com/esm7/obsidian-tasks/pull/18#issuecomment-1196115407
    // From what I can tell, the three missing characters from the original regex - : ! =
    // are all only considered to have special meanings if they directly follow
    // a ? (all 3) or a ?< (! and =).
    // So theoretically if the ? are all escaped, those three characters do not have to be.
    return s.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
}

/**
 * Check that two regular expressions are exactly identical.
 *
 * This is useful when refactoring regular expressions, to avoid accidental differences.
 * It reports any differences by throwing Error.

 * As is intended only during development, upon error it also logs to the console,
 * for ease of finding any errors.
 *
 * @param regexp1
 * @param regexp2
 */
export function checkRegExpsIdentical(regexp1: RegExp, regexp2: RegExp) {
    if (regexp1.toString() !== regexp2.toString()) {
        throw new Error(`regular expressions differ:
${regexp1.toString()}
${regexp2.toString()}
`);
    }
    return true;
}
