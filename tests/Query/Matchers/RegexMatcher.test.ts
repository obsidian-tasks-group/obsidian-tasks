import { RegexMatcher } from '../../../src/Query/Matchers/RegexMatcher';

describe('RegexMatcher', () => {
    it('should match simple regular expression', () => {
        const regex: RegExp = /^hello world$/;
        const matcher = new RegexMatcher(regex);
        expect(matcher.matches('hello world')).toStrictEqual(true);
        expect(matcher.matches('xx hello world yy')).toStrictEqual(false);
        expect(matcher.matches('search me')).toStrictEqual(false);
    });
});
