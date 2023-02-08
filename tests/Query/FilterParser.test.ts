import * as FilterParser from '../../src/Query/FilterParser';

describe('FilterParser', () => {
    it('should parse new-style group line correctly', () => {
        expect(FilterParser.parseGrouper('group by status.name')).not.toBeNull();
        expect(FilterParser.parseGrouper('group by status-name')).toBeNull();
    });
});
