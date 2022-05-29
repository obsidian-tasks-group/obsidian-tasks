import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';

describe('description', () => {
    it('can instantiate', () => {
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description includes wibble',
        );
        expect(filter.filter).toBeDefined();
        expect(filter.error).toBeUndefined();
    });
});
