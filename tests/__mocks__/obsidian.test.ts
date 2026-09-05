import { prepareFuzzySearch } from './obsidian';

// To see Obsidian's actual prepareFuzzySearch() results in its console, use lines like:
//      JSON.stringify(require('obsidian').prepareFuzzySearch('aaa')('ababab'))
//
// Note that the scores used here are different from Obsidian's, but they are good enough for testing purposes.

describe('fake prepareFuzzySearch()', () => {
    it('should do case-insensitive match', () => {
        expect(prepareFuzzySearch('HELLO')('hello')).toEqual({ score: 1 });
    });

    it('should take length in to account when calculating the score', () => {
        expect(prepareFuzzySearch('HELLO')('helloworld')).toEqual({ score: 0.5 });
    });
});
