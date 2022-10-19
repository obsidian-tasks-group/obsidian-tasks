import { Filter, FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import type { FilterFunction } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';
import { Explanation } from '../../../src/Query/Explain/Explanation';

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
        expect(filter.explanation.asString()).toEqual(line);
        expect(filter.filterFunction).not.toBeUndefined();
    });
});

describe('FilterOrErrorMessage', () => {
    it('should construct from FilterFunction', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };

        const instruction = 'description longer than 20 chars';
        const filterOrErrorMessage = FilterOrErrorMessage.fromFilterFunction(instruction, filterFunction);
        expect(filterOrErrorMessage.filter?.explanation.asString()).toEqual(instruction);
    });

    it('should construct from Filter', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };

        const instruction = 'description > 20';
        const explanation = 'description longer than 20 chars';
        const filter = new Filter(instruction, filterFunction);
        filter.explanation = new Explanation(explanation);

        const filterOrErrorMessage = FilterOrErrorMessage.fromFilter(filter);
        expect(filterOrErrorMessage.filter?.instruction).toEqual(instruction);
        expect(filterOrErrorMessage.filter?.explanation.asString()).toEqual(explanation);
    });
});
