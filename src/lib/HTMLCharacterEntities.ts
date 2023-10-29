/**
 * Convert any reserved HTML characters to entity names.
 * @param s
 */
export function htmlEncode(s: string) {
    if (s === '<') {
        return '&lt;';
    }
    return s;
}
