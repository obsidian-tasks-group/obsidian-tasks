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

    it('should expand abbreviations with capital letters', () => {
        expect(doAutocomplete('Td ')).toEqual('today');
        expect(doAutocomplete('tM ')).toEqual('tomorrow');
        expect(doAutocomplete('WeekEnd ')).toEqual('sat');
    });

    it('should not expand other words', () => {
        expect(doAutocomplete('sunshine ')).toEqual('sunshine ');
    });
});
