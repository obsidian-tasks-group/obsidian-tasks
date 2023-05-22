import { DescriptionLengthGroupingfield } from '../../../src/Query/Filter/DescriptionLengthGroupingField';

describe('test a Field class that supports grouping without sorting', () => {
    it('should create the grouper', () => {
        const grouper = new DescriptionLengthGroupingfield().createNormalGrouper();
        expect(grouper).toBeDefined();
    });
});
