import { prepareFuzzySearch } from './obsidian';

describe('fake prepareFuzzySearch()', () => {
    it('should do case-insensitive match', () => {
        expect(prepareFuzzySearch('HELLO')('hello')).toEqual({ score: 1 });
    });

    it('should take length in to account when calculating the score', () => {
        expect(prepareFuzzySearch('HELLO')('helloworld')).toEqual({ score: 0.5 });
    });
});
