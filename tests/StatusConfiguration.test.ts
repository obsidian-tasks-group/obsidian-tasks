import { StatusConfiguration } from '../src/StatusConfiguration';

describe('StatusConfiguration', () => {
    it('preview text', () => {
        const configuration = new StatusConfiguration('P', 'Pro', 'Con', true);
        expect(configuration.previewText()).toEqual("- [P] Pro, next status is 'Con'. ");
    });
});
