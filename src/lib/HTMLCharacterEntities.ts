/**
 * Convert any single reserved HTML character to its entity name.
 * @param character
 *
 * @see htmlEncodeString
 */
export function htmlEncodeCharacter(character: string) {
    const charactersToEntityNames: { [index: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
    };

    const candidateEntityName = charactersToEntityNames[character];
    if (candidateEntityName !== undefined) {
        return candidateEntityName;
    }

    return character;
}

/**
 * Convert reserved HTML characters to their entity names.
 * @param characters
 *
 * @see htmlEncodeCharacter
 */
export function htmlEncodeString(characters: string) {
    const chars = [...characters];
    let result = '';
    chars.forEach((c) => {
        result += htmlEncodeCharacter(c);
    });

    return result;
}
