/**
 * @file This file tests our fake implementation of Obsidian's {@link prepareSimpleSearch}.
 *       Additional fake search functions may be added in the future.
 */

import { prepareSimpleSearch } from '../__mocks__/obsidian';

function simpleSearchShouldNotMatch(searchTerm: string, phrase: string) {
    const fn = prepareSimpleSearch(searchTerm);
    const matches = fn(phrase);
    expect(matches).toBeNull();
}

function simpleSearchResultAsJSON(searchTerm: string, phrase: string) {
    const fn = prepareSimpleSearch(searchTerm);
    const matches = fn(phrase);
    return JSON.stringify(matches, null, 4);
}

// Note: The matches values shown below were obtained by  adding console.log()
//       calls in searchDescriptionWithoutTags() to inspect the results of Obsidian's own
//       prepareSimpleSearch(), and then ensuring our fake version gave the same matches values.
//       No attempt has been made to reproduce the Obsidian-generated score.
describe('prepareSimpleSearch() fake', () => {
    it('should provide prepareSimpleSearch() function to do the search', () => {
        const searchTerm = 'hello';
        const phrase = 'hello world';
        expect(simpleSearchResultAsJSON(searchTerm, phrase)).toMatchInlineSnapshot(`
            "{
                "score": 0,
                "matches": [
                    [
                        0,
                        5
                    ]
                ]
            }"
        `);
    });

    it('should return null if search term is only spaces', () => {
        const searchTerm = ' ';
        const phrase = 'a b c';
        simpleSearchShouldNotMatch(searchTerm, phrase);
    });

    it('should return null if no match', () => {
        const searchTerm = 'NOT PRESENT';
        const phrase = 'aaaaaaaaaaaaaaaaa';
        simpleSearchShouldNotMatch(searchTerm, phrase);
    });

    it('should be case-insensitive', () => {
        const searchTerm = 'MixedCase';
        const phrase = 'mixedcase';
        expect(simpleSearchResultAsJSON(searchTerm, phrase)).toMatchInlineSnapshot(`
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
        expect(simpleSearchResultAsJSON(searchTerm, phrase)).toMatchInlineSnapshot(`
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
        expect(simpleSearchResultAsJSON(searchTerm, phrase)).toMatchInlineSnapshot(`
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
        simpleSearchShouldNotMatch(searchTerm, phrase);
    });
});
