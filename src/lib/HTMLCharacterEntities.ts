/**
 * Convert any single reserved HTML character to its entity name.
 * @param s
 *
 * @see htmlEncodeString
 */
export function htmlEncodeCharacter(s: string) {
    const charactersToEntityNames: { [index: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
    };

    const candidateEntityName = charactersToEntityNames[s];
    if (candidateEntityName !== undefined) {
        return candidateEntityName;
    }

    return s;
}

/**
 * Convert reserved HTML characters to their entity names.
 * @param s
 *
 * @see htmlEncodeCharacter
 */
export function htmlEncodeString(s: string) {
    const chars = [...s];
    let result = '';
    chars.forEach((c) => {
        result += htmlEncodeCharacter(c);
    });

    return result;
}
