import { BooleanDelimiters } from '../../../src/Query/Filter/BooleanDelimiters';

describe('BooleanDelimiters', () => {
    it('construction', () => {
        const delimiters = new BooleanDelimiters();

        expect(delimiters.openFilterChars).toEqual('("');
        expect(delimiters.openFilter).toEqual('[("]');

        expect(delimiters.closeFilterChars).toEqual(')"');
        expect(delimiters.closeFilter).toEqual('[)"]');

        expect(delimiters.openAndCloseFilterChars).toEqual('()"');
    });
});
