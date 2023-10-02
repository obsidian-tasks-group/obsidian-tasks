import * as FilterParser from '../../src/Query/FilterParser';
import { fieldCreators, getFieldCreators } from '../../src/Query/FilterParser';

describe('FilterParser', () => {
    it('should parse new-style group line correctly', () => {
        expect(FilterParser.parseGrouper('group by status.name')).not.toBeNull();
        expect(FilterParser.parseGrouper('group by status-name')).toBeNull();
    });

    it('should provide a function to get the parsers', () => {
        expect(fieldCreators.length).not.toEqual(0);
        expect(getFieldCreators().length).not.toEqual(0);
    });
});
