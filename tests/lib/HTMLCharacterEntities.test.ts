import { htmlEncodeCharacter } from '../../src/lib/HTMLCharacterEntities';

describe('HTMLEntities', () => {
    it('should encode &', () => {
        expect(htmlEncodeCharacter('a')).toEqual('a');
        expect(htmlEncodeCharacter('<')).toEqual('&lt;');
        expect(htmlEncodeCharacter('>')).toEqual('&gt;');
        expect(htmlEncodeCharacter('&')).toEqual('&amp;');
        expect(htmlEncodeCharacter('"')).toEqual('&quot;');
    });
});
