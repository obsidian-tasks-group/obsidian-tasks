import { Filter } from '../../../src/Query/Filter/Filter';
import type { FilterFunction } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toMatchTaskFromLine,
});

describe('Filter', () => {
    it('should create a Filter object', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };
        const line = 'some sample instruction';
        const filter = new Filter(line, filterFunction);

        expect(filter.instruction).toEqual(line);
        expect(filter.filterFunction).not.toBeUndefined();
    });
});
