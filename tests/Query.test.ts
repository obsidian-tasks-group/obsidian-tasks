import { Query } from '../src/Query';

describe('Query', () => {
    it('parses sorting instructions', () => {
        const query = new Query({ source: 'sort by status' });

        expect(query.sorting).toEqual(['status']);
    });
});
