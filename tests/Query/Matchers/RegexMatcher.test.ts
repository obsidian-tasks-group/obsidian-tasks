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

describe('RegexMatcher source', () => {
    it('should allow multiple slashes in source', () => {
        const matcher = RegexMatcher.validateAndConstruct('/a/b/c/d/');
        expect(matcher!.regex.source).toEqual(String.raw`a\/b\/c\/d`);
    });

    it('should allow multiple slashes and delimiters in source', () => {
        const matcher = RegexMatcher.validateAndConstruct('//a/b/c/d//');
        expect(matcher!.regex.source).toEqual(String.raw`\/a\/b\/c\/d\/`);
    });
});

describe('RegexMatcher flags', () => {
    it('should allow "i" flag - case-insensitive', () => {
        const matcher = RegexMatcher.validateAndConstruct('/expression/i');
        expect(matcher!.regex.flags).toEqual('i');
    });

    it('should allow "g" flag - global', () => {
        const matcher = RegexMatcher.validateAndConstruct('/expression/g');
        expect(matcher!.regex.flags).toEqual('g');
    });

    it('should allow "m" flag - multiline', () => {
        const matcher = RegexMatcher.validateAndConstruct('/expression/m');
        expect(matcher!.regex.flags).toEqual('m');
    });

    it('should allow "u" flag - unicode', () => {
        const matcher = RegexMatcher.validateAndConstruct('/expression/u');
        expect(matcher!.regex.flags).toEqual('u');
    });

    it('should allow "img" flags', () => {
        const matcher = RegexMatcher.validateAndConstruct('/expression/img');
        expect(matcher!.regex.flags).toEqual('gim');
    });

    it('should reject invalid "x" flag', () => {
        const t = () => {
            RegexMatcher.validateAndConstruct('/expression/x');
        };
        expect(t).toThrow(SyntaxError);
        expect(t).toThrowError("Invalid flags supplied to RegExp constructor 'x'");
    });

    it('should treat any text after last slash as flags', () => {
        const t = () => {
            RegexMatcher.validateAndConstruct('/root/sub-folder/sub-sub-folder/filename.md');
        };
        expect(t).toThrow(SyntaxError);
        expect(t).toThrowError("Invalid flags supplied to RegExp constructor 'filename.md'");
    });

    it('should reject duplicate "ii" flag', () => {
        const t = () => {
            RegexMatcher.validateAndConstruct('/expression/ii');
        };
        expect(t).toThrow(SyntaxError);
        expect(t).toThrowError("Invalid flags supplied to RegExp constructor 'ii'");
    });
});
