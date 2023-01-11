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
