import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';

describe('explains regular sub-string searches', () => {
    it('should explain simple string search', () => {
        const instruction = 'description includes hello';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation('description includes hello');
    });
});

describe('explains regular expression searches', () => {
    it('should explain regex matches search', () => {
        const instruction = 'description regex matches /hello/';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation(`description regex matches /hello/
  Regular expression interpreted as: /hello/`);
    });

    it('should explain regex does not match search', () => {
        const instruction = 'description regex does not match /hello/';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation(`description regex does not match /hello/
  Regular expression interpreted as: /hello/`);
    });
});
