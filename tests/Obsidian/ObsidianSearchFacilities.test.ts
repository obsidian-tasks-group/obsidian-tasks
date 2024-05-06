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
function caseInsensitiveSubstringSearch(searchTerm: string, phrase: string): SearchResult | null {
    // Support multi-word search terms:
    const searchTerms = searchTerm.split(/\s+/);
    let matches: number[][] = [];

    for (const term of searchTerms) {
        const regex = new RegExp(term, 'gi');
        let match;
        let termFound = false;
        while ((match = regex.exec(phrase)) !== null) {
            matches.push([match.index, match.index + match[0].length]);
            termFound = true;
        }

        // We require all search terms to be found.
        if (!termFound) {
            return null;
        }
    }

    // Sort matches by start index and then by end index
    matches = matches.sort((a, b) => {
        if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    });

    return matches.length > 0
        ? {
              score: 0,
              matches: matches,
          }
        : null;
}

describe('prepareSimpleSearch() mock', () => {
    it('should return null if no match', () => {
        const searchTerm = 'NOT PRESENT';
        const phrase = 'aaaaaaaaaaaaaaaaa';
        const matches = caseInsensitiveSubstringSearch(searchTerm, phrase);
        expect(matches).toBeNull();
    });

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
                        9,
                        12
                    ],
                    [
                        40,
                        43
                    ],
                    [
                        45,
                        49
                    ]
                ]
            }"
        `);
    });

    it('should require all words in query to be found', () => {
        const searchTerm = 'make ZZZ';
        const phrase = 'make aaaaaaa';
        const matches = caseInsensitiveSubstringSearch(searchTerm, phrase);
        expect(matches).toBeNull();
    });
});
