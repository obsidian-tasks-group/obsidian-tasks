import { RegexMatcher } from '../../../src/Query/Matchers/RegexMatcher';

describe('RegexMatcher', () => {
    it('should match simple regular expression', () => {
        const regex: RegExp = /^hello world$/;
        const matcher = new RegexMatcher(regex);
        expect(matcher.matches('hello world')).toStrictEqual(true);
        expect(matcher.matches('xx hello world yy')).toStrictEqual(false);
        expect(matcher.matches('search me')).toStrictEqual(false);
    });

    it('should construct regex from a valid string', () => {
        const matcher = RegexMatcher.validateAndConstruct('/hello world/i');
        expect(matcher).not.toBeNull();
        expect(matcher!.matches('hello world')).toStrictEqual(true);
        expect(matcher!.matches('HELLO world')).toStrictEqual(true); // Confirm that the flag 'i' is retained
        expect(matcher!.matches('Bye Bye')).toStrictEqual(false);
    });

    it('should not construct regex from an INvalid string', () => {
        const matcher = RegexMatcher.validateAndConstruct('I have no slashes');
        expect(matcher).toBeNull();
    });
});
