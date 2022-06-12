import { doAutocomplete } from '../src/DateAbbreviations';

describe('DateAbbreviations', () => {
    it('should expand abbreviations', () => {
        expect(doAutocomplete('td ')).toEqual('today');
        expect(doAutocomplete('tm ')).toEqual('tomorrow');
        expect(doAutocomplete('yd ')).toEqual('yesterday');
        expect(doAutocomplete('tw ')).toEqual('this week');
        expect(doAutocomplete('nw ')).toEqual('next week');
        expect(doAutocomplete('weekend ')).toEqual('sat');
        expect(doAutocomplete('we ')).toEqual('sat');
    });
});
