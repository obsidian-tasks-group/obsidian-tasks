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
    // Support multi-word search terms:
    const searchTerms = searchTerm.split(/\s+/);
    const matches: number[][] = [];

    for (const term of searchTerms) {
        const regex = new RegExp(term, 'gi');
        let match;
        while ((match = regex.exec(phrase)) !== null) {
            matches.push([match.index, match.index + match[0].length]);
        }
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

    it('should support search terms with multiple words', () => {
        const searchTerm = 'make foo';
        const phrase = 'Make the food - duplicate search words: FOOD MAKE';
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
                        45,
                        49
                    ],
                    [
                        9,
                        12
                    ],
                    [
                        40,
                        43
                    ]
                ]
            }"
        `);
    });
});
