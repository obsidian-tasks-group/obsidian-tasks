import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { PriorityField } from '../../../src/Query/Filter/PriorityField';

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

describe('priority error cases', () => {
    it('priority is something', () => {
        const field = new PriorityField();
        const filter = field.createFilterOrErrorMessage('priority is no-such-priority');
        expect(filter.filter).toBeUndefined();
        expect(filter.error).toBe('do not understand query filter (priority)');
    });
});
