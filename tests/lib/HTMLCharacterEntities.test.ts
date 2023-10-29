import { htmlEncode } from '../../src/lib/HTMLCharacterEntities';

describe('HTMLEntities', () => {
    it('should encode &', () => {
        expect(htmlEncode('a')).toEqual('a');
        expect(htmlEncode('<')).toEqual('&lt;');
        expect(htmlEncode('>')).not.toEqual('&gt;');
        expect(htmlEncode('&')).not.toEqual('&amp;');
        expect(htmlEncode('"')).not.toEqual('&quot;');
    });
});
