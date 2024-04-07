import { checkRegExpsIdentical } from '../../src/lib/RegExpTools';

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
