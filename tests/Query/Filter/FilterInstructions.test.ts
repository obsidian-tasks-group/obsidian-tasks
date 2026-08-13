import { FilterInstructions } from '../../../src/Query/Filter/FilterInstructions';
import type { Task } from '../../../src/Task/Task';

describe('FilterInstructions', () => {
    it('should be able to add a valid instruction', () => {
        const instructions = new FilterInstructions();
        instructions.add('hello', (_task: Task) => true);

        const validFilterOrError = instructions.createFilterOrErrorMessage('hello');
        expect(validFilterOrError).toBeValid();
    });

    it('should be able to add an invalid instruction', () => {
        const instructions = new FilterInstructions();
        instructions.add('hello', (_task: Task) => true);

        const invalidFilterOrError = instructions.createFilterOrErrorMessage('goodbye');
        expect(invalidFilterOrError).not.toBeValid();
    });

    it('should be able to add a specific explanation', () => {
        const instructions = new FilterInstructions();
        instructions.add('simple instruction', (_task: Task) => true, 'here is some detailed explanation');

        const filterOrErrorMessage = instructions.createFilterOrErrorMessage('simple instruction');
        expect(filterOrErrorMessage).toHaveExplanation('here is some detailed explanation');
    });
});
