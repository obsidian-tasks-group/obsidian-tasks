import { htmlEncode } from '../../src/lib/HTMLCharacterEntities';

describe('HTMLEntities', () => {
    it('should encode &', () => {
        expect(htmlEncode('a')).toEqual('a');
        expect(htmlEncode('<')).toEqual('&lt;');
        expect(htmlEncode('>')).toEqual('&gt;');
        expect(htmlEncode('&')).toEqual('&amp;');
        expect(htmlEncode('"')).toEqual('&quot;');
    });
});
