import { SubstringMatcher } from '../../../src/Query/Matchers/SubstringMatcher';

describe('SubstringMatcher', () => {
    it('should match simple text', () => {
        const matcher = new SubstringMatcher('find me');
        expect(matcher.matches('find me')).toStrictEqual(true);
        expect(matcher.matches('prefix find me suffix')).toStrictEqual(true);
        expect(matcher.matches('FIND ME')).toStrictEqual(true);
    });
});
