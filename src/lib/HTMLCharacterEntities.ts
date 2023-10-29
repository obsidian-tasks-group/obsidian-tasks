/**
 * Convert any reserved HTML characters to entity names.
 * @param s
 */
export function htmlEncode(s: string) {
    const charactersToEntityNames: { [index: string]: string } = {
        '<': '&lt;',
    };

    const candidateEntityName = charactersToEntityNames[s];
    if (candidateEntityName !== undefined) {
        return candidateEntityName;
    }

    return s;
}
