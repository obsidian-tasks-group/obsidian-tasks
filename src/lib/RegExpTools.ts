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
        console.log(regexp1.toString());
        console.log(regexp2.toString());
        throw new Error(`regular expressions differ:
${regexp1.toString()}
${regexp2.toString()}
`);
    }
    return true;
}
