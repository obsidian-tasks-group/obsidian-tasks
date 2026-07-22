import { checkRegExpsIdentical, validateRegExpSafety } from '../../src/lib/RegExpTools';

describe('regular expression equality', () => {
    it('should recognise identical regular expressions', () => {
        expect(checkRegExpsIdentical(/ABC/i, /ABC/i)).toEqual(true);
    });

    it('should detect differences in case-insensitive flag', () => {
        const t = () => {
            checkRegExpsIdentical(/ABC/, /ABC/i);
        };
        expect(t).toThrow(Error);
    });

    it('should detect differences in global flag', () => {
        const t = () => {
            checkRegExpsIdentical(/ABC/, /ABC/g);
        };
        expect(t).toThrow(Error);
    });
});

describe('validateRegExpSafety', () => {
    it.each([
        ['hello world'],
        [String.raw`\d\d:\d\d`],
        ['(beep|boop)*'],
        [String.raw`\blocation\s*:[^:\n]+\b(Oakland|San Francisco)\b`],
        ['^Log'],
        ['waiting|waits|wartet'],
        [String.raw`#tag\/subtag[0-9]\/subsubtag[0-9]`],
        [String.raw`[⏫🔼🔽📅⏳🛫🔁]`],
    ])('should accept safe pattern: %s', (pattern: string) => {
        expect(validateRegExpSafety(pattern)).toBeNull();
    });

    it.each([
        ['(a+)+$', 'catastrophic backtracking'],
        ['(a+)+b', 'catastrophic backtracking'],
        // Note: (a|a)*$ is a known false negative in safe-regex2 (not detected)
        ['(.*)*', 'catastrophic backtracking'],
        ['(a+){10}', 'catastrophic backtracking'],
        ['(x+x+)+y', 'catastrophic backtracking'],
    ])('should reject unsafe pattern: %s (%s)', (pattern: string, _reason: string) => {
        const result = validateRegExpSafety(pattern);
        expect(result).not.toBeNull();
        expect(result).toContain('catastrophic backtracking');
    });

    it.failing('should reject unsafe pattern, but safe-regex2 does not detect it ', () => {
        // If this starts passing after a future update to safe-regex2:
        // 1. Activate this pattern in the 'known false negative' comment above
        // 2. Delete this test.
        const result = validateRegExpSafety('(a|a)*$');
        expect(result).not.toBeNull();
        expect(result).toContain('catastrophic backtracking');
    });

    it('should reject patterns exceeding the maximum length', () => {
        const longPattern = 'a'.repeat(501);
        const result = validateRegExpSafety(longPattern);
        expect(result).not.toBeNull();
        expect(result).toContain('too long');
    });

    it('should accept patterns at exactly the maximum length', () => {
        const pattern = 'a'.repeat(500);
        expect(validateRegExpSafety(pattern)).toBeNull();
    });
});
