import { Filter } from '../../../src/Query/Filter/Filter';
import { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import type { FilterFunction } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task/Task';
import { Explanation } from '../../../src/Query/Explain/Explanation';

describe('Filter', () => {
    it('should create a Filter object', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };
        const line = 'some sample instruction';
        const filter = new Filter(line, filterFunction, new Explanation(line));

        expect(filter.instruction).toEqual(line);
        expect(filter.explanation.asString()).toEqual(line);
        expect(filter.filterFunction).not.toBeUndefined();

        expect(filter.statement.rawInstruction).toEqual(line);
        expect(filter.statement.anyContinuationLinesRemoved).toEqual(line);
        expect(filter.statement.anyPlaceholdersExpanded).toEqual(line);

        // Note: there is also a test in Query.test.ts that verifies correct populating
        //       of filter.statement via the Query constructor.
    });

    it('should create a Filter object with different explanation', () => {
        const filter = new Filter(
            // instruction differs from explanation
            'some sample instruction',
            (_task: Task) => {
                return true;
            },
            new Explanation('some more detailed explanation of the filter'),
        );

        expect(filter.explainFilterIndented('')).toMatchInlineSnapshot(`
            "some sample instruction =>
              some more detailed explanation of the filter
            "
        `);

        // Check that text is correctly indented:
        expect(filter.explainFilterIndented('  ')).toMatchInlineSnapshot(`
            "  some sample instruction =>
                some more detailed explanation of the filter
            "
        `);
    });
});

describe('FilterOrErrorMessage', () => {
    it('should construct from Filter', () => {
        const filterFunction: FilterFunction = (task: Task) => {
            return task.description.length > 20;
        };

        const instruction = 'description > 20';
        const explanation = 'description longer than 20 chars';
        const filter = new Filter(instruction, filterFunction, new Explanation(explanation));

        const filterOrErrorMessage = FilterOrErrorMessage.fromFilter(filter);
        expect(filterOrErrorMessage.filter?.instruction).toEqual(instruction);
        expect(filterOrErrorMessage.filter?.explanation.asString()).toEqual(explanation);
    });
});
