import { Filter, FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';

describe('Filter', () => {
    it('should create an undefined Filter object', () => {
        const filter = new Filter(undefined);
        expect(filter.filterFunction).toBeUndefined();
    });
});

describe('FilterOrErrorMessage', () => {
    it('should create an empty FilterOrErrorMessage object', () => {
        const filterOrErrorMessage = new FilterOrErrorMessage();
        expect(filterOrErrorMessage.filter).toBeUndefined();
        expect(filterOrErrorMessage.error).toBeUndefined();
    });
});
