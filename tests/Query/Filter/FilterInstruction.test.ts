import { FilterInstruction } from '../../../src/Query/Filter/FilterInstruction';
import type { FilterFunction } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task/Task';

describe('FilterInstruction', () => {
    const filter: FilterFunction = (_task: Task) => true;
    const filterInstruction = new FilterInstruction('find me', filter);

    it('canCreateFilterForLine should be case-insensitive exact match', () => {
        expect(filterInstruction.canCreateFilterForLine('FIND ME')).toEqual(true);
        expect(filterInstruction.canCreateFilterForLine('xFIND ME')).toEqual(false);
        expect(filterInstruction.canCreateFilterForLine('FIND MEx')).toEqual(false);
    });

    it('createFilterOrErrorMessage should be case-insensitive', () => {
        const filterOrErrorMessage = filterInstruction.createFilterOrErrorMessage('FIND ME');
        expect(filterOrErrorMessage).toBeValid();
    });

    it('explanation should be case-insensitive', () => {
        const line = 'FIND ME';
        const filterOrErrorMessage = filterInstruction.createFilterOrErrorMessage(line);
        expect(filterOrErrorMessage).toHaveExplanation(line);
    });
});
