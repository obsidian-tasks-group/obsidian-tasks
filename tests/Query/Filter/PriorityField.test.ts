import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testTaskFilterViaQuery } from '../../TestingTools/FilterTestHelpers';

function testTaskFilterForTaskWithPriority(
    filter: string,
    priority: Priority,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    const task = builder.priority(priority).build();
    testTaskFilterViaQuery(filter, task, expected);
}

// /^priority (is )?(above|below)? ?(low|none|medium|high)/;
describe('priority', () => {
    it('priority is high', () => {
        const filter = 'priority is high';
        testTaskFilterForTaskWithPriority(filter, Priority.Low, false);
        testTaskFilterForTaskWithPriority(filter, Priority.High, true);
    });

    it('priority above none', () => {
        const filter = 'priority above none';
        testTaskFilterForTaskWithPriority(filter, Priority.Low, false);
        testTaskFilterForTaskWithPriority(filter, Priority.None, false);
        testTaskFilterForTaskWithPriority(filter, Priority.Medium, true);
        testTaskFilterForTaskWithPriority(filter, Priority.High, true);
    });
});
