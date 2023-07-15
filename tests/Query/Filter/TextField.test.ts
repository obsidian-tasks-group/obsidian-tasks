import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';

describe('explains regular sub-string searches', () => {
    it('should explain simple string search', () => {
        const instruction = 'description includes hello';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation('description includes hello');
    });
});

describe('explains regular expression searches', () => {
    it('should explain simple regular expression search', () => {
        const instruction = 'description regex matches /hello/';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation('description regex matches /hello/');
    });
});
