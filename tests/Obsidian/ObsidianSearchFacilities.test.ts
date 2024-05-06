interface SearchResult {
    score: number;
    matches: number[][];
}

/**
 * A fake implementation of the function returned by prepareSimpleSearch(),
 * so we can write tests of code that calls that function.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/prepareSimpleSearch
 * @param searchTerm
 * @param phrase
 */
function caseInsensitiveSubstringSearch(searchTerm: string, phrase: string): SearchResult {
    const regex = new RegExp(searchTerm, 'gi');
    const matches: number[][] = [];
    let match;
    while ((match = regex.exec(phrase)) !== null) {
        matches.push([match.index, match.index + match[0].length]);
    }
    return {
        score: 0,
        matches: matches,
    };
}

describe('prepareSimpleSearch() mock', () => {
    it('should be case-insensitive', () => {
        const searchTerm = 'MixedCase';
        const phrase = 'mixedcase';
        const matches = caseInsensitiveSubstringSearch(searchTerm, phrase);
        expect(JSON.stringify(matches, null, 4)).toMatchInlineSnapshot(`
            "{
                "score": 0,
                "matches": [
                    [
                        0,
                        9
                    ]
                ]
            }"
        `);
    });

    it('should find two occurrences of one string', () => {
        const searchTerm = 'gues';
        const phrase = 'Guestimate the number of guests';
        const matches = caseInsensitiveSubstringSearch(searchTerm, phrase);
        expect(JSON.stringify(matches, null, 4)).toMatchInlineSnapshot(`
            "{
                "score": 0,
                "matches": [
                    [
                        0,
                        4
                    ],
                    [
                        25,
                        29
                    ]
                ]
            }"
        `);
    });
});
