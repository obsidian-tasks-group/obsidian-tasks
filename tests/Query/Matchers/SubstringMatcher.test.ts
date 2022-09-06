import { SubstringMatcher } from '../../../src/Query/Matchers/SubstringMatcher';

describe('SubstringMatcher', () => {
    it('should match simple text', () => {
        const matcher = new SubstringMatcher('find me');
        expect(matcher.matches('find me')).toStrictEqual(true);
        expect(matcher.matches('prefix find me suffix')).toStrictEqual(true);
        expect(matcher.matches('FIND ME')).toStrictEqual(true);
    });

    it('should match any values in array of text', () => {
        const matcher = new SubstringMatcher('find me');
        expect(matcher.matchesAnyOf(['wibble', 'stuff', 'FIND ME'])).toStrictEqual(true);
        expect(matcher.matchesAnyOf(['wibble', 'stuff', 'LOSE ME'])).not.toStrictEqual(true);
    });
});
