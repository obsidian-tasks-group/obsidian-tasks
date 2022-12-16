import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { PriorityField } from '../../../src/Query/Filter/PriorityField';

import { toBeValid, toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toBeValid,
    toHaveExplanation,
});

function testTaskFilterForTaskWithPriority(filter: string, priority: Priority, expected: boolean) {
    const builder = new TaskBuilder();
    const filterOrError = new PriorityField().createFilterOrErrorMessage(filter);
    testFilter(filterOrError, builder.priority(priority), expected);
}

describe('priority is', () => {
    it('priority is high', () => {
        const filter = 'priority is high';
        testTaskFilterForTaskWithPriority(filter, Priority.High, true);
        testTaskFilterForTaskWithPriority(filter, Priority.Medium, false);
        testTaskFilterForTaskWithPriority(filter, Priority.None, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Low, false);
    });

    it('priority is medium', () => {
        const filter = 'priority is medium';
        testTaskFilterForTaskWithPriority(filter, Priority.High, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Medium, true);
        testTaskFilterForTaskWithPriority(filter, Priority.None, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Low, false);
    });

    it('priority is none', () => {
        const filter = 'priority is none';
        testTaskFilterForTaskWithPriority(filter, Priority.High, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Medium, false);
        testTaskFilterForTaskWithPriority(filter, Priority.None, true);
        testTaskFilterForTaskWithPriority(filter, Priority.Low, false);
    });

    it('priority is low', () => {
        const filter = 'priority is low';
        testTaskFilterForTaskWithPriority(filter, Priority.High, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Medium, false);
        testTaskFilterForTaskWithPriority(filter, Priority.None, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Low, true);
    });
});

describe('priority above', () => {
    it('priority above none', () => {
        const filter = 'priority above none';
        testTaskFilterForTaskWithPriority(filter, Priority.Low, false);
        testTaskFilterForTaskWithPriority(filter, Priority.None, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Medium, true);
        testTaskFilterForTaskWithPriority(filter, Priority.High, true);
    });
});

describe('priority below', () => {
    it('priority below none', () => {
        const filter = 'priority below none';
        testTaskFilterForTaskWithPriority(filter, Priority.Low, true);
        testTaskFilterForTaskWithPriority(filter, Priority.None, false);
    });
});

describe('priority is not', () => {
    it.each([
        ['low', Priority.Low, false],
        ['low', Priority.None, true],
        ['none', Priority.None, false],
        ['none', Priority.Medium, true],
        ['medium', Priority.None, true],
        ['medium', Priority.Medium, false],
        ['high', Priority.Medium, true],
        ['high', Priority.High, false],
    ])('priority is not %s (with %s)', (filter: string, input: Priority, expected: boolean) => {
        // TODO Use name of input priority instead of
        testTaskFilterForTaskWithPriority(`priority is not ${filter}`, input, expected);
    });
});

describe('priority parses various whitespace combinations', () => {
    // Not tested here: Query strips off trailing whitespace, so spaces at start
    // and end of the instruction do not need testing
    it.each(['priority  is low', 'priority is  low', 'priority is  above low', 'priority\tis\tabove\tlow'])(
        'white space variation: "%s"',
        (filter: string) => {
            const filterOrError = new PriorityField().createFilterOrErrorMessage(filter);
            expect(filterOrError).toBeValid();
        },
    );
});

describe('priority error cases', () => {
    it.each([
        'priority is no-such-priority',
        'priority is abovemedium',
        'priority is above medium-with-nonsense-at-end',
    ])('filter: "%s"', (input: string) => {
        const field = new PriorityField();
        const filter = field.createFilterOrErrorMessage(input);
        expect(filter.filterFunction).toBeUndefined();
        expect(filter.error).toBe('do not understand query filter (priority)');
    });
});

describe('explain priority', () => {
    it('simple case just repeats the supplied line', () => {
        const field = new PriorityField();
        const instruction = 'priority above none';
        const filterOrMessage = field.createFilterOrErrorMessage(instruction);
        expect(filterOrMessage).toHaveExplanation(instruction);
    });

    it('implicit "is" gets added to description', () => {
        const field = new PriorityField();
        const filterOrMessage = field.createFilterOrErrorMessage('priority high');
        expect(filterOrMessage).toHaveExplanation('priority is high');
    });
});

describe('sorting by priority', () => {
    it('does not yet support Field sorting methods', () => {
        const field = new PriorityField();
        // Not yet supported - TODO - rename this test when implementing Priority sorting
        expect(field.supportsSorting()).toEqual(false);
    });
});
