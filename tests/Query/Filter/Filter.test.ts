import { FilterOrErrorMessage, NewFilter } from '../../../src/Query/Filter/Filter';
import type { Filter } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toMatchTaskFromLine,
});

describe('NewFilter', () => {
    it('should create a NewFilter object', () => {
        const filterFunction: Filter = (task: Task) => {
            return task.description.length > 20;
        };
        const filter = new NewFilter(filterFunction);
        expect(filter.filterFunction).not.toBeUndefined();
    });
});

describe('FilterOrErrorMessage', () => {
    it('should create an empty FilterOrErrorMessage object', () => {
        const filterOrErrorMessage = new FilterOrErrorMessage();
        expect(filterOrErrorMessage.filter).toBeUndefined();
        expect(filterOrErrorMessage.newFilter).toBeUndefined();
        expect(filterOrErrorMessage.error).toBeUndefined();
    });

    it('should create FilterOrErrorMessage object for filter', () => {
        const filterFunction: Filter = (task: Task) => {
            return task.description.length > 20;
        };
        const filterOrErrorMessage = FilterOrErrorMessage.fromFilter(filterFunction);
        expect(filterOrErrorMessage.filter).not.toBeUndefined();
        expect(filterOrErrorMessage.newFilter).not.toBeUndefined();
        expect(filterOrErrorMessage.error).toBeUndefined();

        expect(filterOrErrorMessage).toMatchTaskFromLine('- [ ] long task name .....................');
        expect(filterOrErrorMessage).not.toMatchTaskFromLine('- [ ] short name');
    });

    it('should create FilterOrErrorMessage object for error', () => {
        const filterOrErrorMessage = FilterOrErrorMessage.fromError('error happened');
        expect(filterOrErrorMessage.filter).toBeUndefined();
        expect(filterOrErrorMessage.newFilter).toBeUndefined();
        expect(filterOrErrorMessage.error).toEqual('error happened');
    });
});
