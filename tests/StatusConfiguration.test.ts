import { StatusConfiguration } from '../src/StatusConfiguration';

describe('StatusConfiguration', () => {
    it('preview text', () => {
        const configuration = new StatusConfiguration('P', 'Pro', 'Con', true);
        expect(configuration.previewText()).toEqual("- [P] Pro, next status is 'Con'. ");
    });

    it('factory methods for default statuses', () => {
        expect(StatusConfiguration.makeDone().previewText()).toEqual("- [x] Done, next status is ' '. ");
        expect(StatusConfiguration.makeEmpty().previewText()).toEqual("- [] EMPTY, next status is ''. ");
        expect(StatusConfiguration.makeTodo().previewText()).toEqual("- [ ] Todo, next status is 'x'. ");
        expect(StatusConfiguration.makeCancelled().previewText()).toEqual("- [-] Cancelled, next status is ' '. ");
        expect(StatusConfiguration.makeInProgress().previewText()).toEqual("- [/] In Progress, next status is 'x'. ");
    });
});
