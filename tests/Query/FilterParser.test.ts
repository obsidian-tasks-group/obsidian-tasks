import * as FilterParser from '../../src/Query/FilterParser';
import { fieldCreators } from '../../src/Query/FilterParser';

describe('FilterParser', () => {
    it('should parse new-style group line correctly', () => {
        expect(FilterParser.parseGrouper('group by status.name')).not.toBeNull();
        expect(FilterParser.parseGrouper('group by status-name')).toBeNull();
    });

    it('should provide an array to get the parsers', () => {
        expect(fieldCreators.length).not.toEqual(0);
    });
});
