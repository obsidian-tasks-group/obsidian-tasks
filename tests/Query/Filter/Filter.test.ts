import { Filter, FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import type { FilterFunction } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toMatchTaskFromLine,
});

describe('NewFilter', () => {
    it('should create a NewFilter object', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };
        const line = 'some sample instruction';
        const filter = new Filter(line, filterFunction);

        expect(filter.instruction).toEqual(line);
        expect(filter.filterFunction).not.toBeUndefined();
    });
});

describe('FilterOrErrorMessage', () => {
    it('should create an empty FilterOrErrorMessage object', () => {
        const line = 'some sample instruction';
        const filterOrErrorMessage = new FilterOrErrorMessage(line);

        expect(filterOrErrorMessage.instruction).toEqual(line);
        // Everything else should be undefined
        expect(filterOrErrorMessage.filter).toBeUndefined();
        expect(filterOrErrorMessage.filterFunction).toBeUndefined();
        expect(filterOrErrorMessage.error).toBeUndefined();
    });

    it('should retain instruction when updating filter', () => {
        const line = 'some sample instruction';
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };

        const filterOrErrorMessage = new FilterOrErrorMessage(line);
        filterOrErrorMessage.filterFunction = filterFunction;

        expect(filterOrErrorMessage.instruction).toEqual(line);
    });

    it('should create FilterOrErrorMessage object for filter', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };
        const line = 'some sample instruction';
        const filterOrErrorMessage = FilterOrErrorMessage.fromFilter(line, filterFunction);

        expect(filterOrErrorMessage.instruction).toEqual(line);
        expect(filterOrErrorMessage.filter).not.toBeUndefined();
        expect(filterOrErrorMessage.filterFunction).not.toBeUndefined();
        expect(filterOrErrorMessage.error).toBeUndefined();

        expect(filterOrErrorMessage).toMatchTaskFromLine('- [ ] long task name .....................');
        expect(filterOrErrorMessage).not.toMatchTaskFromLine('- [ ] short name');
    });

    it('should create FilterOrErrorMessage object for error', () => {
        const line = 'some sample instruction';
        const filterOrErrorMessage = FilterOrErrorMessage.fromError(line, 'error happened');

        expect(filterOrErrorMessage.instruction).toEqual(line);
        expect(filterOrErrorMessage.error).toEqual('error happened');
        // Everything else should be undefined
        expect(filterOrErrorMessage.filter).toBeUndefined();
        expect(filterOrErrorMessage.filterFunction).toBeUndefined();
    });
});
