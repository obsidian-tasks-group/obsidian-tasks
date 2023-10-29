import { htmlEncodeCharacter, htmlEncodeString } from '../../src/lib/HTMLCharacterEntities';

describe('HTMLEntities', () => {
    it('should encode single characters', () => {
        expect(htmlEncodeCharacter('a')).toEqual('a');
        expect(htmlEncodeCharacter('<')).toEqual('&lt;');
        expect(htmlEncodeCharacter('>')).toEqual('&gt;');
        expect(htmlEncodeCharacter('&')).toEqual('&amp;');
        expect(htmlEncodeCharacter('"')).toEqual('&quot;');
    });

    it('should encode multi-character strings', () => {
        const input = 'This & that in <b>bold</b>';
        const expected = 'This &amp; that in &lt;b&gt;bold&lt;/b&gt;';
        expect(htmlEncodeString(input)).toEqual(expected);
    });
});
