import { Filter } from '../../../src/Query/Filter/Filter';

describe('Filter', () => {
    it('should create an undefined Filter object', () => {
        const filter = new Filter(undefined);
        expect(filter.filterFunction).toBeUndefined();
    });
});
